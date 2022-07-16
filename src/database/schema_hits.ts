import { logger } from '../logger';
import { find } from 'lodash';

import clientsModel from './clients';
import { connection, transact } from './index';
// import prometheus from '../prometheus';
import redis from '../redis';

const schemaHitModel = {
	timer: null,
	// store in a nested name -> version format for out-of-the-box unique checks
	internalCache: [],
	SAVE_INTERVAL_MS: 30 * 1000,
	DELETE_INTERVAL_MS: 5 * 60 * 1000,
	MAX_RETENTION_DAYS: 5,

	init: function () {
		logger.info('starting schema hit entity memory-to-mysql synchronizer');
		schemaHitModel.timer = setInterval(
			schemaHitModel.syncUniqueClientsToDb,
			schemaHitModel.SAVE_INTERVAL_MS
		);

		logger.info('starting schema hit entity periodic cleanup from mysql');
		setInterval(async () => {
			const now = new Date().getTime();

			await schemaHitModel.deleteOlderThan(
				now - schemaHitModel.MAX_RETENTION_DAYS * 24 * 3600 * 1000
			);
		}, schemaHitModel.DELETE_INTERVAL_MS);
	},

	allowNewHitWithTime: function (msgDate) {
		const now = new Date().getTime();

		return (
			msgDate.getTime() >
			now - schemaHitModel.MAX_RETENTION_DAYS * 24 * 3600
		);
	},

	syncUniqueClientsToDb: async function () {
		logger.debug(
			`Hydrating collected schema usage statistics (${schemaHitModel.internalCache.length}) properties`
		);
		for (const row of schemaHitModel.internalCache) {
			await schemaHitModel.storeInDb(row);
		}

		// reset cache
		schemaHitModel.internalCache = [];
	},

	add: async function ({
		name = null,
		version = null,
		entity,
		property,
		day,
	}: {
		name: string | null;
		version: string | null;
		entity: string;
		property: string;
		day: string;
	}) {
		const row = find(schemaHitModel.internalCache, {
			name,
			version,
			entity,
			property,
			day,
		});

		if (row) {
			row.hits++;
		} else {
			schemaHitModel.internalCache.push({
				name,
				version,
				entity,
				property,
				day,
				hits: 1,
			});
		}
	},

	addSchemaHitForNewClient: async function ({
		entity,
		property,
		day,
		incrementHits,
		hits,
	}) {
		await transact(async (trx) => {
			const clientHitCount = (
				await trx('schema_hit').count('entity', { as: 'cnt' }).where({
					entity,
					property,
					day,
					client_id: null,
				})
			)[0].cnt;

			if (clientHitCount > 0) {
				const incrementHitsSQL = incrementHits ? 'hits + ?' : '?';
				await trx.raw(
					`UPDATE schema_hit
					 SET hits = ${incrementHitsSQL}, updated_time=FLOOR(UNIX_TIMESTAMP(NOW(3)) * 1000)
					 WHERE entity = ? AND property = ? AND day = ? AND client_id IS NULL`,
					[hits, entity, property, day]
				);
			} else {
				await trx.raw(
					`INSERT IGNORE INTO schema_hit (entity, property, day, hits, client_id, updated_time)
					 VALUES (?, ?, ?, ?, null, FLOOR(UNIX_TIMESTAMP(NOW(3)) * 1000))`,
					[entity, property, day, hits]
				);
			}
		});
	},

	addSchemaHitForExClient: async function ({
		entity,
		property,
		day,
		client,
		incrementHits,
		hits,
	}) {
		await transact(async (trx) => {
			const clientHitCount = (
				await trx('schema_hit').count('entity', { as: 'cnt' }).where({
					entity,
					property,
					day,
					client_id: client.id,
				})
			)[0].cnt;

			if (clientHitCount > 0) {
				const incrementHitsSQL = incrementHits ? 'hits + ?' : '?';

				await trx.raw(
					`UPDATE schema_hit
					 SET hits = ${incrementHitsSQL}, updated_time = FLOOR(UNIX_TIMESTAMP(NOW(3)) * 1000)
					 WHERE entity = ?
					   AND property = ?
					   AND day = ?
					   AND client_id = ?`,
					[hits, entity, property, day, client.id]
				);
			} else {
				await trx.raw(
					`INSERT IGNORE INTO schema_hit (entity, property, day, hits, client_id, updated_time)
					 VALUES (?, ?, ?, ?, ?, FLOOR(UNIX_TIMESTAMP(NOW(3)) * 1000))`,
					[entity, property, day, hits, client.id]
				);
			}
		});
	},
	storeInDb: async function ({
		incrementHits = true,
		name = null,
		version = null,
		entity,
		property,
		day,
		hits,
	}) {
		let client;

		if (!entity) {
			logger.error('Missing entity');

			return false;
		}

		if (!property) {
			logger.error('Missing property');

			return false;
		}

		await transact(async (trx) => {
			client = await connection('clients')
				.where({ name, version })
				.first('id');

			if (name && version && !client) {
				client = {
					id: await clientsModel.addClientVersion({
						trx,
						name,
						version,
					}),
				};
			}
		});

		if (client) {
			await this.addSchemaHitForExClient({
				entity,
				property,
				day,
				client,
				incrementHits,
				hits,
			});
		} else {
			await this.addSchemaHitForNewClient({
				entity,
				property,
				day,
				incrementHits,
				hits,
			});
		}

		return true;
	},

	get: async function ({ entity, property }) {
		const cachedResults = await redis.get(
			`schema_hits.${entity}.${property}`
		);

		if (cachedResults) {
			return JSON.parse(cachedResults);
		}

		// @ts-ignore
		const results = await connection.raw(
			`SELECT DATE_FORMAT(sh.day, "%Y-%m-%d") as day,
					SUM(sh.hits)                    as hits,
					sh.entity,
					sh.property,
					c.name                          as clientName
			 FROM schema_hit sh
					  LEFT JOIN clients c on sh.client_id = c.id
			 WHERE sh.entity = ?
			   AND sh.property = ?
			 GROUP BY c.name, day
			 ORDER BY c.name, day`,
			[entity, property]
		);

		await redis.set(
			`schema_hits.${entity}.${property}`,
			JSON.stringify(results[0]),
			60
		);

		return results[0];
	},

	list: async function ({ since, limit = 500 }) {
		if (typeof since === 'undefined' || !limit) {
			return [];
		}

		// @ts-ignore
		const results = await connection.raw(
			`SELECT DATE_FORMAT(day, "%Y-%m-%d") as day,
					hits,
					client_id,
					updated_time                 as updatedTime,
					entity,
					property
			 FROM schema_hit
			 WHERE updated_time > ?
			 ORDER BY updated_time
			 LIMIT ?`,
			[since, limit]
		);

		return results[0];
	},

	sum: async function ({ entity, property }) {
		// @ts-ignore
		const result = await connection('schema_hit')
			.sum({ hit_sum: 'hits' })
			.where({ entity, property });

		return result[0].hit_sum;
	},

	deleteOlderThan: async function (timestampMs) {
		const dayFormatted = new Date(timestampMs).toISOString().slice(0, 10);

		logger.info(`Cleaning up schema usage older than ${dayFormatted}`);

		// @ts-ignore
		await connection.raw(
			`DELETE
			 FROM schema_hit
			 WHERE day < ?`,
			[dayFormatted]
		);

		// prometheus.logHitsCleanup(dayFormatted);
	},

	getLatestAddedDate: async () => {
		const trx = connection();

		// @ts-ignore
		const latest = await trx('schema_hit')
			.max('updated_time as updated_time')
			.first();

		return latest.updated_time;
	},
};

export default schemaHitModel;
