import { ClientQueryDAO, ClientUsageDAO } from '../model/client_usage';

export interface RedisService {
	set(key: String, value: String, expireAt?: number): Promise<void>;
	getClientUsage(key: String): Promise<ClientQueryDAO>;
	getCounters(pattern: String): Promise<ClientUsageDAO[]>;
}

export class RedisRepository implements RedisService {
	private static instance: RedisRepository;

	static getInstance(): RedisRepository {
		if (!RedisRepository.instance) {
			RedisRepository.instance = new RedisRepository();
		}

		return RedisRepository.instance;
	}

	getClientUsage(key: String): Promise<ClientQueryDAO> {
		return Promise.resolve(undefined);
	}

	getCounters(pattern: String): Promise<ClientUsageDAO[]> {
		return Promise.resolve([]);
	}

	set(key: String, value: String, expireAt?: number): Promise<void> {
		return Promise.resolve(undefined);
	}
}
