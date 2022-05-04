import diplomat from '../diplomat';
import redis from 'async-redis';
import { logger } from "../logger";

const DEFAULT_TTL = 24 * 3600;
const redisServiceName =
	process.env.REDIS_SCHEMA_REGISTRY || 'schema-registry-redis';

const redisWrapper = {
	redisInstance: null,

	getInstance: async () => {
		if (redisWrapper.redisInstance) {
			return redisWrapper.redisInstance;
		}

		const { host, port, password } = await diplomat.getServiceInstance(
			redisServiceName
		);

		const redisOptions = {
			host: host,
			port: port,
			password: password,
			db: 2,
			retry_strategy: (options) => {
				if (options.error && options.error.code === 'ECONNREFUSED') {
					logger.error('Redis server refused the connection', {
						original_error: options.error,
					});
				}

				// reconnect after
				return Math.min(options.attempt * 100, 3000);
			},
		};

		redisWrapper.redisInstance = redis.createClient(redisOptions);

		redisWrapper.redisInstance.on('ready', redisWrapper.onReady);
		redisWrapper.redisInstance.on('connect', redisWrapper.onConnect);
		redisWrapper.redisInstance.on('reconnecting', redisWrapper.onReconnecting);
		redisWrapper.redisInstance.on('error', redisWrapper.onError);
		redisWrapper.redisInstance.on('end', redisWrapper.onEnd);

		return redisWrapper.redisInstance;
	},

	get: async (key) => {
		return await (await redisWrapper.getInstance()).get(key);
	},

	set: async (key, value, ttl = DEFAULT_TTL) => {
		await (await redisWrapper.getInstance()).set(key, value, 'EX', ttl);
	},

	delete: async (key) => {
		return await (await redisWrapper.getInstance()).del(key);
	},

	onEnd: function () {
		logger.info('Redis server connection has closed!');
	},

	onError: function (error) {
		logger.error(
			`An error occurred while fetching data from Redis : ${error.message}`,
			{
				original_error: error,
			}
		);
	},

	onReconnecting: function () {
		logger.info('Redis client is reconnecting to the server!');
	},

	onConnect: function () {
		logger.info(`Redis client is connected`);
	},

	onReady: function () {
		logger.info('Redis client is ready!');
	},
};

export default redisWrapper;
