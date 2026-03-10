import { get, isNil } from 'lodash';
import { Kind, TypeInfo, parse } from 'graphql';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Knex } from 'knex';

import { logger } from '../../logger';
import redis from '../../redis';
import { composeAndValidateSchema } from '../../helpers/federation';

import schemaModel from '../../database/schema';
import clientsModel from '../../database/clients';
import schemaHit from '../../database/schema_hits';
import operationHit from '../../database/operation_hits';
import persistedQueries from '../../database/persisted_queries';

import extractQueryFields from './extract-query-properties';
import { connection } from '../../database';

const SCHEMA_UPDATE_PERIOD_MIN = 5;
const QUERIES_CHANNEL =
	process.env.REDIS_QUERIES_CHANNEL ||
	process.env.KAFKA_QUERIES_TOPIC ||
	'graphql-queries';

function firstHeaderValue(value) {
	if (Array.isArray(value)) {
		return value[0];
	}
	return value;
}

const analyzer = {
	typeInfo: null,

	loadSchema: async function (trx: Knex) {
		logger.info('Updating schema for query analysis');

		const schemas = await schemaModel.getLastUpdatedForActiveServices({
			trx,
		});
		const schema = composeAndValidateSchema(schemas);

		analyzer.typeInfo = new TypeInfo(schema.toGraphQLJSSchema());
	},
	start: async function () {
		try {
			logger.info('starting query analyzer');
			logger.info('loading federated schema');
			await analyzer.loadSchema(connection);

			// update schema periodically
			setInterval(
				async () => {
					logger.info('reloading federated schema');
					await analyzer.loadSchema(connection);
				},
				SCHEMA_UPDATE_PERIOD_MIN * 60 * 1000
			);

			schemaHit.init();
			operationHit.init();
			clientsModel.init();

			await redis.initRedis();
			await redis.subscribe(QUERIES_CHANNEL, analyzer.processRequest);
			logger.info(
				`query analyzer subscribed to redis channel ${QUERIES_CHANNEL}`
			);
		} catch (e) {
			// Redis pub/sub is optional
			logger.error(e);
		}
	},

	processRequest: async (message) => {
		logger.info('query analyzer received message from redis', {
			payloadSize: String(message || '').length,
		});

		let parsedData;
		try {
			parsedData = JSON.parse(String(message));
		} catch (error) {
			logger.warn(`Skipping malformed query event payload`, { message, error });
			return;
		}

		let name;
		let version;

		if (parsedData.headers) {
			const persistedQueryHash = get(
				parsedData,
				'persistedQueryHash.sha256Hash'
			);

			name = firstHeaderValue(parsedData.headers['apollographql-client-name']);
			version = firstHeaderValue(
				parsedData.headers['apollographql-client-version']
			);

			// Fallback for clients that don't send Apollo client headers.
			if (isNil(name)) {
				const origin = firstHeaderValue(parsedData.headers.origin);
				const referer = firstHeaderValue(parsedData.headers.referer);
				const userAgent = firstHeaderValue(parsedData.headers['user-agent']);

				try {
					const source = origin || referer;
					if (source) {
						name = new URL(source).host;
					}
				} catch (_) {
					// ignore URL parsing errors and fallback below
				}

				if (isNil(name) && userAgent) {
					name = 'browser';
				}
			}

			if (isNil(version) && !isNil(name)) {
				version =
					firstHeaderValue(parsedData.headers['x-client-version']) ||
					firstHeaderValue(parsedData.headers['x-app-version']) ||
					firstHeaderValue(parsedData.headers['sec-ch-ua']) ||
					'unknown';
			}

			if (!parsedData.query) {
				const pq = await persistedQueries.get(persistedQueryHash);

				if (pq) {
					parsedData.query = pq.query;
				}
			}

			if (!isNil(name) && !isNil(version)) {
				clientsModel.add({ name, version, persistedQueryHash });
				logger.info('Tracked client usage', { name, version });
			} else {
				logger.info(
					'Client headers missing, skipping client tracking for this query',
					{
						operationName: parsedData.operationName || null,
						availableHeaderKeys: Object.keys(parsedData.headers || {}),
					}
				);
			}
		}

		const parsedTimestamp = Number(parsedData.timestamp);
		const msgDate = Number.isFinite(parsedTimestamp)
			? new Date(parsedTimestamp)
			: new Date();

		if (parsedData.query && schemaHit.allowNewHitWithTime(msgDate)) {
			logger.info('Processing schema-hit', {
				operationName: parsedData.operationName || null,
			});
			try {
				const operationType = getOperationType(
					parsedData.query,
					parsedData.operationName
				);
				const hour = `${msgDate.toISOString().slice(0, 13)}:00:00.000Z`;

				await operationHit.add({
					name,
					version,
					operationName: parsedData.operationName || 'anonymous',
					operationType,
					hour,
				});

				// Subscription operations are tracked on operation level.
				// Field-level schema usage is based on federated query schema
				// and does not apply to event-stream subscription schema.
				if (operationType === 'SUBSCRIPTION') {
					logger.info('Recorded subscription operation hit', {
						operationName: parsedData.operationName || null,
					});
					return;
				}

				const processedFields = await analyzer.processSchemaQueryUsage({
					name,
					version,
					query: parsedData.query,
					msgDate,
				});

				if (processedFields === 0) {
					logger.warn('Query analyzer extracted 0 schema fields', {
						operationName: parsedData.operationName,
						clientName: name,
						clientVersion: version,
					});
				} else {
					logger.info('Query analyzer extracted schema fields', {
						operationName: parsedData.operationName || null,
						fields: processedFields,
					});
				}
			} catch (error) {
				logger.error('Failed to process schema query usage', {
					error,
					operationName: parsedData.operationName,
				});
			}
		} else {
			logger.debug(
				'Skipping schema-hit - either no query or old msgDate',
				msgDate
			);
		}
	},

	processSchemaQueryUsage: async ({ name, version, query, msgDate }) => {
		const visitedFields = await extractQueryFields(query, analyzer.typeInfo);
		const day = msgDate.toISOString().slice(0, 10);
		const hour = `${msgDate.toISOString().slice(0, 13)}:00:00.000Z`;

		for await (const { entity, property } of visitedFields) {
			// prometheus.logUsedProperty({
			// 	clientName: name,
			// 	clientVersion: version,
			// 	entity,
			// 	property
			// });

			await schemaHit.add({
				name,
				version,
				entity,
				property,
				day,
				hour,
			});
		}

		return visitedFields.length;
	},
};

function getOperationType(query, operationName) {
	try {
		const parsedQuery = parse(query);
		const operationDefinition = parsedQuery.definitions.find((definition) => {
			if (definition.kind !== Kind.OPERATION_DEFINITION) {
				return false;
			}

			if (!operationName) {
				return true;
			}

			return definition.name?.value === operationName;
		});

		if (
			operationDefinition &&
			operationDefinition.kind === Kind.OPERATION_DEFINITION
		) {
			return String(operationDefinition.operation || 'UNKNOWN').toUpperCase();
		}
	} catch (_) {
		// ignore parse failures and fallback to UNKNOWN
	}

	return 'UNKNOWN';
}

export default analyzer;
