import Redis from 'ioredis';
import Redlock from 'redlock';
import { logger } from '../logger';
import diplomat from '../diplomat';

const DEFAULT_TTL = 24 * 3600;
const GET_TIMEOUT_MS = 30;
const SET_TIMEOUT_MS = 50;
const DEFAULT_LOCK_TTL = 60 * 1000;

let redis, redlockClient;

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

async function initRedis(
	redisServiceName = process.env.REDIS_SCHEMA_REGISTRY ||
		'gql-schema-registry-redis'
) {
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

		redis.on('ready', () =>
			logger.info(`Redis connection to ${redisServiceName} ready`)
		);

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

const redisWrap = {
	initRedis,

	disconnect: () => {
		redis?.disconnect();
	},

	get: async (key) => {
		try {
			if (redis) {
				return await Promise.race([
					redis.get(key),
					wait(GET_TIMEOUT_MS),
				]);
			} else {
				logger.warn('redis is not initialized');

				return null;
			}
		} catch (e) {
			logger.error('redis.get failed', e);

			return null;
		}
	},

	set: async (key, value, ttl = DEFAULT_TTL) => {
		try {
			if (redis) {
				await Promise.race([
					redis.set(key, value, 'EX', ttl),
					wait(SET_TIMEOUT_MS),
				]);
			} else {
				logger.warn('redis is not initialized');
			}
		} catch (e) {
			logger.error('redis.set failed', e);
		}
	},

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
};

export default redisWrap;
