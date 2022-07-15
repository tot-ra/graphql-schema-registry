/* eslint-disable camelcase */
const { Kafka } = require('kafkajs');
const { isNil, get } = require('lodash');

let producer;

const requestLogger = {
	connectToKafka: async () => {
		try {
			console.info('Connecting to kafka');

			const kafka = new Kafka({
				clientId: 'graphql-service',
				brokers: ['localhost:29092'],
			});

			producer = kafka.producer();

			// TODO make sure to reconnect to kafka if connection is lost
			await producer.connect();
		} catch (e) {
			console.error(e);
		}
	},

	register: () => ({
		requestDidStart: async (requestContext) => {
			console.log('requestDidStart');

			if (isNil(producer)) {
				await requestLogger.connectToKafka();
				console.error(
					'Kafka producer is not connected, cannot log query'
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
				};

				if (get(requestContext, 'request.http.headers')) {
					eventPayload.headers = Object.fromEntries(
						requestContext.request.http.headers
					);
				}

				console.log('Sending message to kafka', eventPayload);
				// validate that event matches declared schema
				await producer.send({
					topic: 'graphql-queries', // will be changed to local.mytopic + region added automatically
					messages: [
						{
							headers: {},
							value: JSON.stringify(eventPayload),
						},
					],
				});
			} catch (e) {
				console.error(e);
			}
		},
	}),
};

module.exports = requestLogger;
