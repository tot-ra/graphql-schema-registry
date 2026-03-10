import Redis from 'ioredis';
import Redlock from 'redlock';
import { logger } from '../logger';
import diplomat from '../diplomat';

const DEFAULT_TTL = 24 * 3600;
const GET_TIMEOUT_MS = Number(process.env.REDIS_GET_TIMEOUT_MS || 150);
const SET_TIMEOUT_MS = Number(process.env.REDIS_SET_TIMEOUT_MS || 200);
const DEFAULT_LOCK_TTL = 60 * 1000;

let redis, redisSubscriber, redlockClient;
let lastGetTimeoutWarnAt = 0;
let lastSetTimeoutWarnAt = 0;

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
			db,
		} = await diplomat.getServiceInstance(service);

		return { host, port, username, password, db };
	} catch (err) {
		logger.warn(err, 'Redis discovery failed');

		return {};
	}
}

async function initRedis() {
	try {
		if (redis && redis.status !== 'end') {
			return redis;
		}

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
				await resolveInstance('gql-schema-registry-redis')
			);
		});

		redis.on('ready', () => logger.info(`Redis connection to redis ready`));
		redis.on('error', (e) => logger.error(`Redis error`, e));

		Object.assign(
			redis.options || {},
			await resolveInstance('gql-schema-registry-redis')
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
		redisSubscriber?.disconnect();
	},

	get: async (key) => {
		try {
			if (redis) {
				return await Promise.race([redis.get(key), wait(GET_TIMEOUT_MS)]);
			} else {
				logger.warn('redis is not initialized');

				return null;
			}
		} catch (e) {
			const isTimeout = String(e?.message || '').includes('Executed timeout');
			if (isTimeout) {
				const now = Date.now();
				if (now - lastGetTimeoutWarnAt > 60 * 1000) {
					lastGetTimeoutWarnAt = now;
					logger.warn(
						`redis.get timed out after ${GET_TIMEOUT_MS}ms, falling back to DB`
					);
				}
			} else {
				logger.error('redis.get failed', e);
			}

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
			const isTimeout = String(e?.message || '').includes('Executed timeout');
			if (isTimeout) {
				const now = Date.now();
				if (now - lastSetTimeoutWarnAt > 60 * 1000) {
					lastSetTimeoutWarnAt = now;
					logger.warn(
						`redis.set timed out after ${SET_TIMEOUT_MS}ms, continuing without cache write`
					);
				}
			} else {
				logger.error('redis.set failed', e);
			}
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

			lock
				.unlock()
				.catch((error) => logger.error(error, 'Redis unlock failed'));

			throw error;
		}
	},

	publish: async (channel, payload) => {
		try {
			if (!redis) {
				await initRedis();
			}

			if (redis) {
				await redis.publish(channel, payload);
			} else {
				logger.warn(`redis is not initialized, publish skipped for ${channel}`);
			}
		} catch (e) {
			logger.error(`redis.publish failed for channel ${channel}`, e);
		}
	},

	subscribe: async (channel, onMessage) => {
		try {
			if (!redis) {
				await initRedis();
			}

			if (!redis) {
				logger.warn(
					`redis is not initialized, subscribe skipped for ${channel}`
				);
				return async () => {};
			}

			if (!redisSubscriber || redisSubscriber.status === 'end') {
				redisSubscriber = redis.duplicate();
				redisSubscriber.on('error', (e) =>
					logger.error(`Redis subscriber error`, e)
				);
				await redisSubscriber.connect();
			}

			const handler = async (incomingChannel, message) => {
				if (incomingChannel === channel) {
					await onMessage(message);
				}
			};

			redisSubscriber.on('message', handler);
			await redisSubscriber.subscribe(channel);

			return async () => {
				if (redisSubscriber) {
					redisSubscriber.off('message', handler);
					await redisSubscriber.unsubscribe(channel);
				}
			};
		} catch (e) {
			logger.error(`redis.subscribe failed for channel ${channel}`, e);
			return async () => {};
		}
	},
};

export default redisWrap;
