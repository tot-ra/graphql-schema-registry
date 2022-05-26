import {
	ClientOperationDAO,
	ClientOperationsDTO,
	Executions,
	ExecutionsDAO,
} from '../model/client_usage';
import redisClient from './index';
import { KeyHandler } from './key_handler';

export interface RedisService {
	set(key: String, value: String, expireAt?: number): Promise<void>;
	getOperationUsageByField(id: number): Promise<ClientOperationsDTO>;
	getCounters(pattern: String): Promise<ClientUsageDAO[]>;
	getExecutionsFromOperation(
		hash: string,
		startDate,
		endDate
	): Promise<Executions>;
}

export interface ExecutionsInput {
	hash: string;
	startDate: Date;
	endDate: Date;
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

	async getOperationUsageByField(id: number): Promise<ClientOperationsDTO> {
		const allOperationsPattern = `${this.keyHandler.prefixes.operation}*`;
		const allOperationKeys = await this.client.scan(allOperationsPattern);
		const allOperations = await this.client.multiGet<ClientOperationDAO>(
			allOperationKeys
		);
		const operations: ClientOperationsDTO = new Map<
			string,
			ClientOperationDAO
		>();
		allOperations.forEach((operation, index) => {
			if (operation !== null && this.validateFieldUsage(id, operation)) {
				operations.set(allOperationKeys[index], operation);
			}
		});
		return operations;
	}

	async getExecutionsFromOperation(
		input: ExecutionsInput
	): Promise<ExecutionsDAO> {
		const errorPattern =
			this.keyHandler.getErrorExecutionsKeyPattern(input);
		const errorKeys = await this.client.scan(errorPattern);
		const error = await this.client.multiGet<number>(errorKeys);
		const errorMap = new Map<string, number>();
		errorKeys.forEach((key, index) => {
			if (error[index] !== null) {
				errorMap.set(key, error[index]);
			}
		});
		// TODO: filter by error key date inside input range
		// return success too
		// return with hash
	}

	getCounters(pattern: String): Promise<ClientUsageDAO[]> {
		return Promise.resolve([]);
	}

	set(key: String, value: String, expireAt?: number): Promise<void> {
		return Promise.resolve(undefined);
	}

	private validateFieldUsage(
		fieldId: number,
		dao: ClientOperationDAO
	): boolean {
		return dao.operations.some((operation) =>
			operation.entities.some((e) => e.fields.some((f) => f === fieldId))
		);
	}

	private get;
}
