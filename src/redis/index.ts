import Redis from 'ioredis';
import Redlock from 'redlock';
import { logger } from '../logger';
import diplomat from '../diplomat';

const DEFAULT_TTL = 24 * 3600;
const GET_TIMEOUT_MS = 1000;
const SET_TIMEOUT_MS = 1000;
const DEFAULT_LOCK_TTL = 60 * 1000;
const redisServiceName =
	process.env.REDIS_SCHEMA_REGISTRY || 'gql-schema-registry-redis';

let redis: Redis;
let redlockClient;

async function wait(ms) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			reject(new Error(`Executed timeout after ${ms} ms`));
		}, ms);
	});
}

async function resolveInstance(service) {
	try {
		const {
			host,
			port,
			username,
			secret: password,
		} = await diplomat.getServiceInstance(service);

		return { host, port, username, password };
	} catch (err) {
		logger.warn(err, 'Redis discovery failed');

		return {};
	}
}

async function initRedis() {
	try {
		// @ts-ignore
		redis = new Redis({
			maxRetriesPerRequest: 1,
			db: 2,
			dropBufferSupport: true,
			lazyConnect: true,
			showFriendlyErrorStack: true,
		});

		redis.on('reconnecting', async () => {
			logger.warn('Redis reconnect triggered, re-discovering');
			Object.assign(
				redis.options || {},
				await resolveInstance(redisServiceName)
			);
		});

		redis.on('ready', () => logger.info(`Redis connection to redis ready`));
		redis.on('error', (e) => logger.error(`Redis error`, e));

		Object.assign(
			redis.options || {},
			await resolveInstance(redisServiceName)
		);

		await redis.connect();

		return redis;
	} catch (error) {
		logger.error('Failed to initialize redis', error);
	}
}

const getRedlockClient = () => {
	if (redlockClient) {
		return redlockClient;
	}

	return new Redlock([redis], {
		retryCount: 0,
	});
};

export async function doRedisOperationWithTimeout<PromiseOutput>(
	operation: Promise<PromiseOutput>,
	timeout = SET_TIMEOUT_MS
): Promise<PromiseOutput | null> {
	try {
		if (redis) {
			return (await Promise.race([
				operation,
				wait(timeout),
			])) as PromiseOutput;
		}
		logger.warn('redis is not initialized');
	} catch (err) {
		logger.warn('redis operation failed or time out', err);
	}
	return null;
}

const redisWrap = {
	initRedis,

	disconnect: () => {
		redis?.disconnect();
	},

	exists: (key, timeout = GET_TIMEOUT_MS) =>
		doRedisOperationWithTimeout(redis.exists(key), timeout),

	get: (key, timeout = GET_TIMEOUT_MS) =>
		doRedisOperationWithTimeout(redis.get(key), timeout),

	multiGet: async (
		keys: string[],
		timeout = SET_TIMEOUT_MS
	): Promise<(string | null)[] | null> =>
		doRedisOperationWithTimeout(redis.mget(keys), timeout),

	set: (key, value, ttl = DEFAULT_TTL, timeout = SET_TIMEOUT_MS) =>
		doRedisOperationWithTimeout(redis.set(key, value, 'EX', ttl), timeout),

	del: async (key) => {
		try {
			if (redis) {
				await redis.del(key);
			} else {
				logger.warn('redis is not initialized');
			}
		} catch (e) {
			logger.error('redis.del failed', e);
		}
	},

	incr: (key, total, timeout = SET_TIMEOUT_MS) =>
		doRedisOperationWithTimeout(redis.incrby(key, total), timeout),

	incrOrSet: (key, value, ttl = DEFAULT_TTL, timeout = SET_TIMEOUT_MS * 2) =>
		doRedisOperationWithTimeout(
			(async () => {
				const exists = await redis.exists(key);

				if (exists) {
					await redis.incrby(key, value);
				} else {
					await redis.set(key, value, 'EX', ttl);
				}
			})(),
			timeout
		),

	flush: () => redis.flushall(),

	keys: async (pattern) => doRedisOperationWithTimeout(redis.keys(pattern)),

	lock: async (key, fn, ttl = DEFAULT_LOCK_TTL) => {
		let lock;

		const lockKey = `locks.${key}`;

		try {
			lock = await getRedlockClient().lock(lockKey, ttl);
		} catch (err) {
			if (err.name === 'LockError') {
				return;
			}

			throw err;
		}

		try {
			return await fn();
		} catch (error) {
			logger.error(error, 'Failed to process lock function');

			lock.unlock().catch((error) =>
				logger.error(error, 'Redis unlock failed')
			);

			throw error;
		}
	},

	scan: async (
		pattern: string,
		timeout = SET_TIMEOUT_MS
	): Promise<string[] | null> => {
		const operation = async () => {
			const found: string[] = [];
			const endCursor = '0';
			let cursor = endCursor;

			do {
				const [newCursor, foundKeys] = await redis.scan(
					cursor,
					'MATCH',
					pattern
				);
				cursor = newCursor;
				found.push(...foundKeys);
			} while (cursor !== endCursor);

			return found;
		};
		return doRedisOperationWithTimeout(operation(), timeout);
	},
};

export default redisWrap;
