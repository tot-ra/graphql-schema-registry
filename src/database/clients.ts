import { get, isNil } from 'lodash';

import { logger } from '../logger';
import { connection } from './index';

// @ts-ignore
const clientsModel = {
	timer: null,
	// store in a nested name -> version format for out-of-the-box unique checks
	internalCache: {},
	SAVE_INTERVAL_MS: 30 * 1000,

	init: () => {
		clientsModel.timer = setInterval(clientsModel.syncUniqueClientsToDb, clientsModel.SAVE_INTERVAL_MS);
	},

	add: ({ name, version, persistedQueryHash }) => {
		if (!get(clientsModel.internalCache, `${name}`)) {
			clientsModel.internalCache[name] = {};
		}

		if (!get(clientsModel.internalCache, `${name}.${version}`)) {
			clientsModel.internalCache[name][version] = {
				persistedQueries: []
			};
		}

		if (clientsModel.internalCache[name][version].persistedQueries.indexOf(persistedQueryHash) < 0) {
			clientsModel.internalCache[name][version].persistedQueries.push(persistedQueryHash);
		}
	},

	getFlatClients: (internalCache) => {
		const flatClients = [];

		// convert to flat format
		for (const [name, versions] of Object.entries(internalCache)) {
			for (const [version, data] of Object.entries(versions)) {
				flatClients.push({
					name,
					version,
					persistedQueries: data.persistedQueries
				});
			}
		}

		return flatClients;
	},

	syncUniqueClientsToDb: async () => {
		const trx = connection();
		const clientUsageFlat = clientsModel.getFlatClients(clientsModel.internalCache);

		logger.debug(`saving to db ${clientUsageFlat.length} clients detected`);

		// update usage stats
		for (const { name, version, persistedQueries } of clientUsageFlat) {
			// add clientVersion
			// eslint-disable-next-line camelcase
			const clientVersionId = await clientsModel.addClientVersion({
				trx,
				name,
				version
			});

			for (const pqKey of persistedQueries) {
				if (pqKey) {
					try {
						// @ts-ignore
						await trx.raw(
							'INSERT IGNORE INTO clients_persisted_queries_rel (version_id, pq_key) VALUES (?, ?)',
							[clientVersionId, pqKey]
						);
					} catch (e) {
						logger.warn(e, { version_id: clientVersionId, pqKey });
					}
				}
			}
		}

		// reset cache
		clientsModel.internalCache = {};
	},

	addClientVersion: async ({ trx = connection(), name, version, addedTime = null }) => {
		// @ts-ignore
		const sql = await trx('clients')
			.insert({
				name,
				version,
				added_time: addedTime
			})
			.toString()
			.replace('insert', 'INSERT IGNORE');

		// @ts-ignore
		await trx.raw(sql);

		// @ts-ignore
		const result = await trx('clients')
			.select('id')
			.where({
				name,
				version
			})
			.first();

		return result?.id;
	},

	getLatestAddedDate: async () => {
		// @ts-ignore
		const latest = await connection()('clients').max('added_time as added_time').first();

		return latest.added_time;
	},

	getClientVersion: async ({ id, trx = connection() }) => {
		// @ts-ignore
		return await trx('clients')
			.select(['id', 'name', 'version', 'updated_time as updatedTime'])
			.where({
				id
			})
			.limit(1)
			.first();
	},

	getClientVersionByName: async ({ name, version, trx = connection() }) => {
		// @ts-ignore
		return await trx('clients')
			.select('id', 'version', 'updated_time as updatedTime')
			.where({
				name,
				version
			})
			.limit(1)
			.first();
	},

	// @ts-ignore
	getClients: async () => connection()('clients').distinct('name'),
	getVersions: async (name) =>
		// @ts-ignore
		connection()('clients').select('id', 'version', 'updated_time as updatedTime').where({ name }),

	getClientVersionsSince: async ({ since }) => {
		if (isNil(since)) {
			return [];
		}

		// @ts-ignore
		return connection()('clients')
			.select(['id', 'name', 'version', 'added_time as addedTime', 'updated_time'])
			.where((knex) => {
				return knex.where('added_time', '>', since);
			})
			.limit(100);
	}
};

export default clientsModel;
