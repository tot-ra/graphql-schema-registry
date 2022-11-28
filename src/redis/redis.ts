import { logger } from '../logger';
import {
	ClientOperationDAO,
	ClientOperationsDTO,
	ExecutionsDAO,
} from '../model/client_usage';
import redisClient from './index';
import { KeyHandler } from './key_handler';

export interface ExecutionsInput {
	clientId: number;
	hash: string;
	startSeconds: number;
	endSeconds: number;
}

export interface RedisService {
	set(key: string, value: string, expireAt?: number): Promise<void>;
	getOperationsByUsage(
		id: number,
		type: validationType
	): Promise<ClientOperationsDTO>;
	getCounters(pattern: string): Promise<ExecutionsDAO[]>;
	getExecutionsFromOperation(input: ExecutionsInput): Promise<ExecutionsDAO>;
}

type validationType = 'operation' | 'entity' | 'field';

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
		type: validationType
	): Promise<ClientOperationsDTO> {
		const allOperationsPattern = `${this.keyHandler.prefixes.operation}*`;
		const allOperationKeys = await this.client.scan(
			allOperationsPattern,
			10000
		);

		const operations: ClientOperationsDTO = new Map<
			string,
			ClientOperationDAO
		>();

		if (!allOperationKeys.length) return operations;
		const allOperations = await this.client.multiGet<string>(
			allOperationKeys,
			10000
		);

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
		const allKeys = await this.client.scan(pattern, 10000);
		const keysInDates = allKeys.filter((key) => {
			const dateSeconds = this.keyHandler.getDateSecondsFromKey(key);
			return (
				dateSeconds >= input.startSeconds &&
				dateSeconds <= input.endSeconds
			);
		});
		try {
			const executions = await this.client.multiGet<number>(
				keysInDates,
				10000
			);
			return executions.reduce((acc, curr) => (acc += Number(curr)), 0);
		} catch (error) {
			logger.warn(
				'Error getting execution between dates',
				JSON.stringify(allKeys)
			);
			return 0;
		}
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
			clientId: input.clientId,
		} as ExecutionsDAO;
	}

	getCounters(pattern: string): Promise<ExecutionsDAO[]> {
		return Promise.resolve([]);
	}

	set(key: string, value: string, expireAt?: number): Promise<void> {
		return Promise.resolve(undefined);
	}

	private validateUsage(
		id: number,
		dao: ClientOperationDAO,
		type: validationType
	): boolean {
		switch (type) {
			case 'entity':
				return this.validateEntityUsage(id, dao);
			case 'operation':
				return this.validateOperationUsage(id, dao);
			case 'field':
				return this.validateFieldUsage(id, dao);
		}
	}

	private validateOperationUsage(
		id: number,
		dao: ClientOperationDAO
	): boolean {
		return dao.operations
			.filter(Boolean)
			.some((operation) => operation.id === id);
	}

	private validateEntityUsage(id: number, dao: ClientOperationDAO): boolean {
		return dao.operations
			.filter(Boolean)
			.some((operation) =>
				operation.entities.some((e) => e.objectId === id)
			);
	}

	private validateFieldUsage(id: number, dao: ClientOperationDAO): boolean {
		return dao.operations
			.filter(Boolean)
			.some((operation) =>
				operation.entities.some((entity) => entity.fields.includes(id))
			);
	}

	private get;
}
