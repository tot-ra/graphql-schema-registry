import { logger } from '../logger';
import { find } from 'lodash';

import clientsModel from './clients';
import { connection, transact } from './index';
import { rowsFromRaw } from './raw-results';
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
		logger.info('starting schema hit entity memory-to-db synchronizer');
		schemaHitModel.timer = setInterval(
			schemaHitModel.syncUniqueClientsToDb,
			schemaHitModel.SAVE_INTERVAL_MS
		);

		logger.info('starting schema hit entity periodic cleanup from db');
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
			now - schemaHitModel.MAX_RETENTION_DAYS * 24 * 3600 * 1000
		);
	},

	syncUniqueClientsToDb: async function () {
		if (schemaHitModel.internalCache.length > 0) {
			logger.info(
				`Hydrating collected schema usage statistics (${schemaHitModel.internalCache.length}) properties`
			);
		}
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
		hour = null,
	}: {
		name: string | null;
		version: string | null;
		entity: string;
		property: string;
		day: string;
		hour?: string | null;
	}) {
		const row = find(schemaHitModel.internalCache, {
			name,
			version,
			entity,
			property,
			day,
			hour,
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
				hour,
				hits: 1,
			});
		}
	},

	upsertSchemaHit: async function ({
		table,
		bucketColumn,
		bucketValue,
		entity,
		property,
		clientId = null,
		incrementHits,
		hits,
	}) {
		await transact(async (trx) => {
			const clientHitCount = (
				await trx(table)
					.count('entity', { as: 'cnt' })
					.where({
						entity,
						property,
						[bucketColumn]: bucketValue,
					})
					.modify((queryBuilder) => {
						if (clientId === null) {
							queryBuilder.whereNull('client_id');
							return;
						}

						queryBuilder.where({ client_id: clientId });
					})
			)[0].cnt;

			if (clientHitCount > 0) {
				await trx(table)
					.where({
						entity,
						property,
						[bucketColumn]: bucketValue,
					})
					.modify((queryBuilder) => {
						if (clientId === null) {
							queryBuilder.whereNull('client_id');
							return;
						}

						queryBuilder.where({ client_id: clientId });
					})
					.update({
						hits: incrementHits ? trx.raw('hits + ?', [hits]) : hits,
						updated_time: Date.now(),
					});
			} else {
				await trx(table)
					.insert({
						entity,
						property,
						[bucketColumn]: bucketValue,
						hits,
						client_id: clientId,
						updated_time: Date.now(),
					})
					.onConflict(['client_id', 'entity', 'property', bucketColumn])
					.ignore();
			}
		});
	},

	addSchemaHitForNewClient: async function ({
		entity,
		property,
		day,
		hour,
		incrementHits,
		hits,
	}) {
		await this.upsertSchemaHit({
			table: 'schema_hit',
			bucketColumn: 'day',
			bucketValue: day,
			entity,
			property,
			clientId: null,
			incrementHits,
			hits,
		});

		if (!hour) {
			return;
		}

		await this.upsertSchemaHit({
			table: 'schema_hit_hourly',
			bucketColumn: 'hour',
			bucketValue: hour,
			entity,
			property,
			clientId: null,
			incrementHits,
			hits,
		});
	},

	addSchemaHitForExClient: async function ({
		entity,
		property,
		day,
		hour,
		client,
		incrementHits,
		hits,
	}) {
		await this.upsertSchemaHit({
			table: 'schema_hit',
			bucketColumn: 'day',
			bucketValue: day,
			entity,
			property,
			clientId: client.id,
			incrementHits,
			hits,
		});

		if (!hour) {
			return;
		}

		await this.upsertSchemaHit({
			table: 'schema_hit_hourly',
			bucketColumn: 'hour',
			bucketValue: hour,
			entity,
			property,
			clientId: client.id,
			incrementHits,
			hits,
		});
	},
	storeInDb: async function ({
		incrementHits = true,
		name = null,
		version = null,
		entity,
		property,
		day,
		hour = null,
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
			client = await connection('clients').where({ name, version }).first('id');

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
				hour,
				client,
				incrementHits,
				hits,
			});
		} else {
			await this.addSchemaHitForNewClient({
				entity,
				property,
				day,
				hour,
				incrementHits,
				hits,
			});
		}

		return true;
	},

	get: async function ({ entity, property, granularity = 'DAY' }) {
		const cachedResults = await redis.get(
			`schema_hits.${granularity}.${entity}.${property}`
		);

		if (cachedResults) {
			return JSON.parse(cachedResults);
		}

		const results =
			granularity === 'HOUR'
				? await connection.raw(
						`SELECT TO_CHAR(sh.hour, 'YYYY-MM-DD') as day,
								TO_CHAR(sh.hour, 'YYYY-MM-DD"T"HH24:00:00"Z"') as bucket,
								SUM(sh.hits)                                    as hits,
								sh.entity,
								sh.property,
								c.name                                           as "clientName"
						 FROM schema_hit_hourly sh
								  LEFT JOIN clients c on sh.client_id = c.id
						 WHERE sh.entity = ?
						   AND sh.property = ?
						 GROUP BY c.name, sh.hour, sh.entity, sh.property
						 ORDER BY c.name, sh.hour`,
						[entity, property]
					)
				: await connection.raw(
						`SELECT TO_CHAR(sh.day, 'YYYY-MM-DD') as day,
								TO_CHAR(sh.day, 'YYYY-MM-DD') as bucket,
								SUM(sh.hits)                    as hits,
								sh.entity,
								sh.property,
								c.name                          as "clientName"
						 FROM schema_hit sh
								  LEFT JOIN clients c on sh.client_id = c.id
						 WHERE sh.entity = ?
						   AND sh.property = ?
						 GROUP BY c.name, day, sh.entity, sh.property
						 ORDER BY c.name, day`,
						[entity, property]
					);

		const rows = rowsFromRaw(results);

		await redis.set(
			`schema_hits.${granularity}.${entity}.${property}`,
			JSON.stringify(rows),
			60
		);

		return rows;
	},

	getEntityHits: async function ({
		granularity = 'HOUR',
		hours = 24,
	}: {
		granularity?: 'DAY' | 'HOUR';
		hours?: number;
	}) {
		const sanitizedHours = Number.isFinite(hours)
			? Math.max(1, Math.min(24 * 30, Math.floor(hours)))
			: 24;

		const cacheKey = `schema_hits_entity.${granularity}.${sanitizedHours}`;
		const cachedResults = await redis.get(cacheKey);

		if (cachedResults) {
			return JSON.parse(cachedResults);
		}

		const results =
			granularity === 'HOUR'
				? await connection.raw(
						`SELECT sh.entity,
								TO_CHAR(sh.hour, 'YYYY-MM-DD"T"HH24:00:00"Z"') as bucket,
								SUM(sh.hits)::int as hits
						 FROM schema_hit_hourly sh
						 WHERE sh.hour >= NOW() - (? || ' hour')::interval
						 GROUP BY sh.entity, sh.hour
						 ORDER BY sh.hour, sh.entity`,
						[sanitizedHours]
					)
				: await connection.raw(
						`SELECT sh.entity,
								TO_CHAR(sh.day, 'YYYY-MM-DD') as bucket,
								SUM(sh.hits)::int as hits
						 FROM schema_hit sh
						 WHERE sh.day >= CURRENT_DATE - (? || ' day')::interval
						 GROUP BY sh.entity, sh.day
						 ORDER BY sh.day, sh.entity`,
						[Math.max(1, Math.ceil(sanitizedHours / 24))]
					);

		const rows = rowsFromRaw(results);

		await redis.set(cacheKey, JSON.stringify(rows), 60);

		return rows;
	},

	getClientHits: async function ({
		granularity = 'HOUR',
		hours = 24,
	}: {
		granularity?: 'DAY' | 'HOUR';
		hours?: number;
	}) {
		const sanitizedHours = Number.isFinite(hours)
			? Math.max(1, Math.min(24 * 30, Math.floor(hours)))
			: 24;

		const cacheKey = `schema_hits_client.${granularity}.${sanitizedHours}`;
		const cachedResults = await redis.get(cacheKey);

		if (cachedResults) {
			return JSON.parse(cachedResults);
		}

		const results =
			granularity === 'HOUR'
				? await connection.raw(
						`SELECT c.name as "clientName",
								c.version as "clientVersion",
								TO_CHAR(sh.hour, 'YYYY-MM-DD"T"HH24:00:00"Z"') as bucket,
								SUM(sh.hits)::int as hits
						 FROM schema_hit_hourly sh
								  LEFT JOIN clients c on sh.client_id = c.id
						 WHERE sh.hour >= NOW() - (? || ' hour')::interval
						 GROUP BY c.name, c.version, sh.hour
						 ORDER BY sh.hour, c.name, c.version`,
						[sanitizedHours]
					)
				: await connection.raw(
						`SELECT c.name as "clientName",
								c.version as "clientVersion",
								TO_CHAR(DATE_TRUNC('day', sh.hour), 'YYYY-MM-DD') as bucket,
								SUM(sh.hits)::int as hits
						 FROM schema_hit_hourly sh
								  LEFT JOIN clients c on sh.client_id = c.id
						 WHERE sh.hour >= NOW() - (? || ' hour')::interval
						 GROUP BY c.name, c.version, DATE_TRUNC('day', sh.hour)
						 ORDER BY DATE_TRUNC('day', sh.hour), c.name, c.version`,
						[sanitizedHours]
					);

		const rows = rowsFromRaw(results);
		await redis.set(cacheKey, JSON.stringify(rows), 60);
		return rows;
	},

	listFields: async function () {
		const results = await connection.raw(
			`SELECT daily.entity,
					daily.property,
					daily."hitsSum",
					COALESCE(hourly_1h."hits1h", 0)::int as "hits1h",
					COALESCE(hourly_24h."hits24h", 0)::int as "hits24h"
			 FROM (
					  SELECT sh.entity,
							 sh.property,
							 SUM(sh.hits)::int as "hitsSum"
					  FROM schema_hit sh
					  GROUP BY sh.entity, sh.property
				  ) daily
					  LEFT JOIN (
				 SELECT sh.entity,
						sh.property,
						SUM(sh.hits)::int as "hits1h"
				 FROM schema_hit_hourly sh
				 WHERE sh.hour >= NOW() - INTERVAL '1 hour'
				 GROUP BY sh.entity, sh.property
			 ) hourly_1h
								ON daily.entity = hourly_1h.entity
									AND daily.property = hourly_1h.property
					  LEFT JOIN (
				 SELECT sh.entity,
						sh.property,
						SUM(sh.hits)::int as "hits24h"
				 FROM schema_hit_hourly sh
				 WHERE sh.hour >= NOW() - INTERVAL '24 hour'
				 GROUP BY sh.entity, sh.property
			 ) hourly_24h
								ON daily.entity = hourly_24h.entity
									AND daily.property = hourly_24h.property
			 ORDER BY "hits24h" DESC, "hitsSum" DESC, daily.entity, daily.property`
		);

		return rowsFromRaw(results);
	},

	list: async function ({ since, limit = 500 }) {
		if (typeof since === 'undefined' || !limit) {
			return [];
		}

		const results = await connection.raw(
			`SELECT TO_CHAR(day, 'YYYY-MM-DD') as day,
					hits::int                      as hits,
					client_id,
					updated_time                 as "updatedTime",
					entity,
					property
			 FROM schema_hit
			 WHERE updated_time > ?
			 ORDER BY updated_time
			 LIMIT ?`,
			[since, limit]
		);

		return rowsFromRaw(results);
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
		const hourFormatted = new Date(timestampMs).toISOString();

		logger.info(`Cleaning up schema usage older than ${dayFormatted}`);

		await connection.raw(
			`DELETE
			 FROM schema_hit
			 WHERE day < ?`,
			[dayFormatted]
		);
		await connection.raw(
			`DELETE
			 FROM schema_hit_hourly
			 WHERE hour < ?`,
			[hourFormatted]
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
