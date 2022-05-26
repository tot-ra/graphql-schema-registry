export interface RedisService {
	getClientUsage(key: String): Promise<any>;
	getCounters(pattern: String): Promise<any[]>;
}

export class RedisRepository implements RedisService {
	private static instance: RedisRepository;

	static getInstance(): RedisRepository {
		if (!RedisRepository.instance) {
			RedisRepository.instance = new RedisRepository();
		}

		return RedisRepository.instance;
	}
	getClientUsage(key: String): Promise<any> {
		return Promise.resolve(undefined);
	}

	getCounters(pattern: String): Promise<any[]> {
		return Promise.resolve([]);
	}
}
