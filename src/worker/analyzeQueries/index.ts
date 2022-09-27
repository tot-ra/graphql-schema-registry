import { get, isNil } from 'lodash';
import { TypeInfo } from 'graphql';
import { Knex } from 'knex';

import { logger } from '../../logger';
import { initConsumer } from '../../kafka';
import { composeAndValidateSchema } from '../../helpers/federation';

import schemaModel from '../../database/schema';
import clientsModel from '../../database/clients';
import schemaHit from '../../database/schema_hits';
import persistedQueries from '../../database/persisted_queries';

import extractQueryFields from './extract-query-properties';
import { connection } from '../../database';

const SCHEMA_UPDATE_PERIOD_MIN = 5;

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
			setInterval(async () => {
				logger.info('reloading federated schema');
				await analyzer.loadSchema(connection);
			}, SCHEMA_UPDATE_PERIOD_MIN * 60 * 1000);

			schemaHit.init();
			clientsModel.init();

			const consumer = await initConsumer();

			await consumer.subscribe({
				topic: process.env.KAFKA_QUERIES_TOPIC || 'graphql-queries',
				fromBeginning: true,
			});
			await consumer.run({
				partitionsConsumedConcurrently: 3,
				eachMessage: analyzer.processRequest,
			});
		} catch (e) {
			// kafka is not mandatory
			logger.error(e);
		}
	},

	// topic, message.offset, partition, message.key
	processRequest: async ({ message }) => {
		const parsedData = JSON.parse(String(message.value));

		let name;
		let version;

		if (parsedData.headers) {
			const persistedQueryHash = get(
				parsedData,
				'persistedQueryHash.sha256Hash'
			);

			name = parsedData.headers['apollographql-client-name'];
			version = parsedData.headers['apollographql-client-version'];

			if (!parsedData.query) {
				const pq = await persistedQueries.get(persistedQueryHash);

				if (pq) {
					parsedData.query = pq.query;
				}
			}

			if (!isNil(name) && !isNil(version)) {
				clientsModel.add({ name, version, persistedQueryHash });
			}
		}

		const msgDate = new Date(Math.floor(message.timestamp));

		if (parsedData.query && schemaHit.allowNewHitWithTime(msgDate)) {
			logger.debug('Processing schema-hit');
			await analyzer.processSchemaQueryUsage({
				name,
				version,
				query: parsedData.query,
				msgDate,
			});
		} else {
			logger.debug(
				'Skipping schema-hit - either no query or old msgDate',
				msgDate
			);
		}
	},

	processSchemaQueryUsage: async ({ name, version, query, msgDate }) => {
		const visitedFields = await extractQueryFields(
			query,
			analyzer.typeInfo
		);
		const day = msgDate.toISOString().slice(0, 10);

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
			});
		}
	},
};

export default analyzer;
