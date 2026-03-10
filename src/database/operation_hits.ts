import { find } from 'lodash';

import clientsModel from './clients';
import { connection, transact } from './index';
import { rowsFromRaw } from './raw-results';
import redis from '../redis';
import { logger } from '../logger';

const operationHitModel = {
	timer: null,
	internalCache: [],
	SAVE_INTERVAL_MS: 30 * 1000,
	DELETE_INTERVAL_MS: 5 * 60 * 1000,
	MAX_RETENTION_DAYS: 5,

	init: function () {
		logger.info('starting operation hit memory-to-db synchronizer');
		operationHitModel.timer = setInterval(
			operationHitModel.syncUniqueClientsToDb,
			operationHitModel.SAVE_INTERVAL_MS
		);

		logger.info('starting operation hit periodic cleanup from db');
		setInterval(async () => {
			const now = Date.now();
			await operationHitModel.deleteOlderThan(
				now - operationHitModel.MAX_RETENTION_DAYS * 24 * 3600 * 1000
			);
		}, operationHitModel.DELETE_INTERVAL_MS);
	},

	syncUniqueClientsToDb: async function () {
		for (const row of operationHitModel.internalCache) {
			await operationHitModel.storeInDb(row);
		}

		operationHitModel.internalCache = [];
	},

	add: async function ({
		name = null,
		version = null,
		operationName = 'anonymous',
		operationType = 'UNKNOWN',
		hour,
	}: {
		name: string | null;
		version: string | null;
		operationName: string;
		operationType: string;
		hour: string;
	}) {
		const row = find(operationHitModel.internalCache, {
			name,
			version,
			operationName,
			operationType,
			hour,
		});

		if (row) {
			row.hits++;
		} else {
			operationHitModel.internalCache.push({
				name,
				version,
				operationName,
				operationType,
				hour,
				hits: 1,
			});
		}
	},

	upsertOperationHit: async function ({
		operationName,
		operationType,
		hour,
		clientId = null,
		incrementHits,
		hits,
	}) {
		await transact(async (trx) => {
			const operationHitCount = (
				await trx('schema_operation_hit_hourly')
					.count('operation_name', { as: 'cnt' })
					.where({
						operation_name: operationName,
						operation_type: operationType,
						hour,
					})
					.modify((queryBuilder) => {
						if (clientId === null) {
							queryBuilder.whereNull('client_id');
							return;
						}

						queryBuilder.where({ client_id: clientId });
					})
			)[0].cnt;

			if (operationHitCount > 0) {
				await trx('schema_operation_hit_hourly')
					.where({
						operation_name: operationName,
						operation_type: operationType,
						hour,
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
				await trx('schema_operation_hit_hourly')
					.insert({
						operation_name: operationName,
						operation_type: operationType,
						hour,
						hits,
						client_id: clientId,
						updated_time: Date.now(),
					})
					.onConflict(['client_id', 'operation_name', 'operation_type', 'hour'])
					.ignore();
			}
		});
	},

	storeInDb: async function ({
		incrementHits = true,
		name = null,
		version = null,
		operationName,
		operationType,
		hour,
		hits,
	}) {
		let client;

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

		await this.upsertOperationHit({
			operationName,
			operationType,
			hour,
			clientId: client ? client.id : null,
			incrementHits,
			hits,
		});

		return true;
	},

	getHits: async function ({
		granularity = 'HOUR',
		hours = 24,
	}: {
		granularity?: 'DAY' | 'HOUR';
		hours?: number;
	}) {
		const sanitizedHours = Number.isFinite(hours)
			? Math.max(1, Math.min(24 * 30, Math.floor(hours)))
			: 24;

		const cacheKey = `operation_hits.${granularity}.${sanitizedHours}`;
		const cachedResults = await redis.get(cacheKey);

		if (cachedResults) {
			return JSON.parse(cachedResults);
		}

		const results =
			granularity === 'HOUR'
				? await connection.raw(
						`SELECT operation_name as "operationName",
								operation_type as "operationType",
								TO_CHAR(hour, 'YYYY-MM-DD"T"HH24:00:00"Z"') as bucket,
								SUM(hits)::int as hits
						 FROM schema_operation_hit_hourly
						 WHERE hour >= NOW() - (? || ' hour')::interval
						 GROUP BY operation_name, operation_type, hour
						 ORDER BY hour, operation_name`,
						[sanitizedHours]
				  )
				: await connection.raw(
						`SELECT operation_name as "operationName",
								operation_type as "operationType",
								TO_CHAR(DATE_TRUNC('day', hour), 'YYYY-MM-DD') as bucket,
								SUM(hits)::int as hits
						 FROM schema_operation_hit_hourly
						 WHERE hour >= NOW() - (? || ' hour')::interval
						 GROUP BY operation_name, operation_type, DATE_TRUNC('day', hour)
						 ORDER BY DATE_TRUNC('day', hour), operation_name`,
						[sanitizedHours]
				  );

		const rows = rowsFromRaw(results);
		await redis.set(cacheKey, JSON.stringify(rows), 60);
		return rows;
	},

	getTopOperations: async function ({ hours = 24, limit = 20 }) {
		const sanitizedHours = Number.isFinite(hours)
			? Math.max(1, Math.min(24 * 30, Math.floor(hours)))
			: 24;
		const sanitizedLimit = Number.isFinite(limit)
			? Math.max(1, Math.min(200, Math.floor(limit)))
			: 20;

		const cacheKey = `operation_hits.top.${sanitizedHours}.${sanitizedLimit}`;
		const cachedResults = await redis.get(cacheKey);

		if (cachedResults) {
			return JSON.parse(cachedResults);
		}

		const results = await connection.raw(
			`SELECT operation_name as "operationName",
					operation_type as "operationType",
					SUM(hits)::int as hits
			 FROM schema_operation_hit_hourly
			 WHERE hour >= NOW() - (? || ' hour')::interval
			 GROUP BY operation_name, operation_type
			 ORDER BY hits DESC, operation_name
			 LIMIT ?`,
			[sanitizedHours, sanitizedLimit]
		);

		const rows = rowsFromRaw(results);
		await redis.set(cacheKey, JSON.stringify(rows), 60);
		return rows;
	},

	deleteOlderThan: async function (timestampMs) {
		const hourFormatted = new Date(timestampMs).toISOString();
		await connection.raw(
			`DELETE FROM schema_operation_hit_hourly WHERE hour < ?`,
			[hourFormatted]
		);
	},
};

export default operationHitModel;
