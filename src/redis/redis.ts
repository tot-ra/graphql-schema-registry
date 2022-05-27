import {
	ClientOperationDAO,
	ClientOperationsDTO,
	ExecutionsDAO,
} from '../model/client_usage';
import redisClient from './index';
import { KeyHandler } from './key_handler';

export interface ExecutionsInput {
	hash: string;
	startSeconds: number;
	endSeconds: number;
}

export interface RedisService {
	set(key: String, value: String, expireAt?: number): Promise<void>;
	getOperationsByUsage(
		id: number,
		type: 'operation' | 'entity'
	): Promise<ClientOperationsDTO>;
	getCounters(pattern: String): Promise<ExecutionsDAO[]>;
	getExecutionsFromOperation(input: ExecutionsInput): Promise<ExecutionsDAO>;
}

export class RedisRepository implements RedisService {
	private static instance: RedisRepository;
	private client = redisClient;
	private keyHandler = new KeyHandler();

	static getInstance(): RedisRepository {
		if (!RedisRepository.instance) {
			RedisRepository.instance = new RedisRepository();
		}

		return RedisRepository.instance;
	}

	async getOperationsByUsage(
		id: number,
		type: 'operation' | 'entity'
	): Promise<ClientOperationsDTO> {
		const allOperationsPattern = `${this.keyHandler.prefixes.operation}*`;
		const allOperationKeys = await this.client.scan(allOperationsPattern);
		const allOperations = await this.client.multiGet<string>(
			allOperationKeys
		);
		const operations: ClientOperationsDTO = new Map<
			string,
			ClientOperationDAO
		>();
		allOperations.forEach((o, index) => {
			const operation = JSON.parse(o);
			if (operation !== null && this.validateUsage(id, operation, type)) {
				operations.set(allOperationKeys[index], operation);
			}
		});
		return operations;
	}

	async getExecutionsBetweenDates(
		input: ExecutionsInput,
		type: 'error' | 'success'
	): Promise<number> {
		const pattern = this.keyHandler.getExecutionsKeyPattern(input, type);
		const allKeys = await this.client.scan(pattern);
		const keysInDates = allKeys.filter((key) => {
			const dateSeconds = this.keyHandler.getDateSecondsFromKey(key);
			return (
				dateSeconds >= input.startSeconds &&
				dateSeconds <= input.endSeconds
			);
		});
		const executions = await this.client.multiGet<number>(keysInDates);
		return executions.reduce((acc, curr) => (acc += curr), 0);
	}

	async getExecutionsFromOperation(
		input: ExecutionsInput
	): Promise<ExecutionsDAO> {
		const error = await this.getExecutionsBetweenDates(input, 'error');
		const success = await this.getExecutionsBetweenDates(input, 'success');
		return {
			error,
			success,
			total: error + success,
			hash: input.hash,
		} as ExecutionsDAO;
	}

	getCounters(pattern: String): Promise<ExecutionsDAO[]> {
		return Promise.resolve([]);
	}

	set(key: String, value: String, expireAt?: number): Promise<void> {
		return Promise.resolve(undefined);
	}

	private validateUsage(
		id: number,
		dao: ClientOperationDAO,
		type: 'operation' | 'entity'
	): boolean {
		return type === 'operation'
			? this.validateOperationUsage(id, dao)
			: this.validateEntityUsage(id, dao);
	}

	private validateOperationUsage(
		id: number,
		dao: ClientOperationDAO
	): boolean {
		return dao.operations.some((operation) => operation.id === id);
	}

	private validateEntityUsage(id: number, dao: ClientOperationDAO): boolean {
		return dao.operations.some((operation) =>
			operation.entities.some((e) => e.objectId === id)
		);
	}

	private get;
}
