const { knex } = require('./index');
const redis = require('../redis');
const DEFAULT_TTL = 12 * 3600;

const PersistedQueriesModel = {
	count: async function () {
		return (
			await knex('persisted_queries').count('key', { as: 'amount' })
		)[0].amount;
	},

	list: async function ({ searchFragment = '', limit = 100, offset = 0 }) {
		return knex('persisted_queries')
			.select(['query', 'key', 'added_time'])
			.where('query', 'like', `%${searchFragment}%`)
			.offset(offset)
			.limit(limit);
	},

	get: async function ({ key, trx = knex }) {
		const cachedPersistedQuery = await redis.get(key);

		if (cachedPersistedQuery) {
			return JSON.parse(cachedPersistedQuery);
		}

		const rows = await trx('persisted_queries')
			.select(['query', 'key', 'added_time'])
			.where({
				key,
			})
			.limit(1);

		const persistedQuery = rows.length ? rows[0] : null;

		if (persistedQuery) {
			await redis.set(key, JSON.stringify(persistedQuery), DEFAULT_TTL);
		}

		return persistedQuery;
	},

	set: async function ({ persistedQuery, ttl = DEFAULT_TTL }) {
		await knex.raw(
			knex('persisted_queries')
				.insert(persistedQuery)
				.toString()
				.replace(/^insert/i, 'insert ignore')
		);

		// no need to wait until it finishes
		await redis.set(
			persistedQuery.key,
			JSON.stringify(persistedQuery),
			ttl
		);
	},

	getSince: async function ({ since = 0 }) {
		await knex('persisted_queries')
			.select(['query', 'key', 'added_time', 'updated_time'])
			.where((knex) => {
				return knex
					.where('added_time', '>', since)
					.orWhere('updated_time', '>', since);
			})
			.limit(100);
	},

	getLatestAddTime: async function () {
		const latest = await knex('persisted_queries')
			.max('added_time as added_time')
			.first();

		return latest.added_time;
	},
};

module.exports = PersistedQueriesModel;
