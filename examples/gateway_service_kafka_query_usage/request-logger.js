/* eslint-disable camelcase */
const Redis = require('ioredis');
const { isNil, get } = require('lodash');

let redisPublisher;
const queriesChannel = process.env.REDIS_QUERIES_CHANNEL || 'graphql-queries';

const requestLogger = {
	connectToRedis: async () => {
		try {
			console.info('Connecting to redis');
			redisPublisher = new Redis(
				process.env.REDIS_URL || 'redis://localhost:6004',
				{ lazyConnect: true }
			);
			await redisPublisher.connect();
		} catch (e) {
			console.error(e);
		}
	},

	register: () => ({
		requestDidStart: async (requestContext) => {
			console.log('requestDidStart');

			if (isNil(redisPublisher)) {
				await requestLogger.connectToRedis();
				console.error(
					'Redis publisher is not connected, cannot log query event'
				);
				// Do not return false, because:
				// "If your plugin doesn't need to respond to any request lifecycle events
				// requestDidStart should not return a value."
				// https://www.apollographql.com/docs/apollo-server/integrations/plugins/#requestdidstart
			}

			try {
				const eventPayload = {
					query: get(requestContext, 'request.query'),
					operationName: get(requestContext, 'request.operationName'),
					persistedQueryHash: get(
						requestContext,
						'request.extensions.persistedQuery'
					),
					timestamp: Date.now(),
				};

				if (get(requestContext, 'request.http.headers')) {
					eventPayload.headers = Object.fromEntries(
						requestContext.request.http.headers
					);
				}

				console.log('Publishing query event to redis', eventPayload);
				await redisPublisher.publish(queriesChannel, JSON.stringify(eventPayload));
			} catch (e) {
				console.error(e);
			}
		},
	}),
};

module.exports = requestLogger;
