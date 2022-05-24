export interface RedisService {
	set(key: String, value: String, expireAt?: number): Promise<void>;
	getClientUsage(key: String): Promise<any>;
	getCounters(pattern: String): Promise<any[]>;
}

export class RedisRepository implements RedisService {
	getClientUsage(key: String): Promise<any> {
		return Promise.resolve(undefined);
	}

	getCounters(pattern: String): Promise<any[]> {
		return Promise.resolve([]);
	}

	set(key: String, value: String, expireAt?: number): Promise<void> {
		return Promise.resolve(undefined);
	}
}
