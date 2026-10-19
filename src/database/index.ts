import diplomat from '../diplomat';
import { logger } from '../logger';

const DB_SCHEMA_REGISTRY =
	process.env.DB_SCHEMA_REGISTRY || 'gql-schema-registry-db';

import knex from 'knex';

function booleanFor(variable: string | undefined, defaultValue = 'false') {
	return (variable || defaultValue).toLowerCase() === 'true';
}

function parseDbSsl() {
	if (!booleanFor(process.env.DB_SSL)) {
		return undefined;
	}

	const ssl: { rejectUnauthorized: boolean; ca?: string } = {
		rejectUnauthorized: booleanFor(
			process.env.DB_SSL_REJECT_UNAUTHORIZED,
			'true'
		),
	};

	if (process.env.DB_SSL_CA) {
		ssl.ca = process.env.DB_SSL_CA.replace(/\\n/g, '\n');
	}

	return ssl;
}

function intFromEnv(variable: string | undefined, defaultValue: number) {
	const parsed = parseInt(variable || '', 10);
	return Number.isNaN(parsed) ? defaultValue : parsed;
}

// The knex default (min 2, max 10) keeps 2 connections open forever and can open 10 per process,
// which is too much when the Postgres server is shared with other services (small max_connections).
// max stays >= 2: knex migrations hold a lock transaction on one connection and migrate on another
function poolConfig() {
	const max = Math.max(2, intFromEnv(process.env.DB_POOL_MAX, 4));
	const min = Math.min(max, Math.max(0, intFromEnv(process.env.DB_POOL_MIN, 0)));
	const idleTimeoutMillis = intFromEnv(process.env.DB_POOL_IDLE_TIMEOUT_MS, 10000);

	return {
		min,
		max,
		idleTimeoutMillis: idleTimeoutMillis >= 1000 ? idleTimeoutMillis : 10000,
	};
}

function cleanupSQL(sql) {
	return sql.replace(
		/(\(\?(?:, \?)+\))(, \(\?(?:, \?)+\))+/,
		(match, first) => `${first}/* ×${match.split('),').length} */`
	);
}

function logQuery({ sql }) {
	sql = cleanupSQL(sql);
	logger.debug(`DB query ${sql}`);
}
function logQueryError(error, { sql }) {
	sql = cleanupSQL(sql);
	logger.debug(`DB error ${error} on query : ${sql}`);
}

const { host, port, username, secret, name } =
	diplomat.getServiceInstance(DB_SCHEMA_REGISTRY);
const dbConfig = diplomat.getServiceInstance(DB_SCHEMA_REGISTRY);

export const connection = knex({
	client: dbConfig.client || 'pg',
	log: {
		warn: logger.info,
		error: logger.error,
		deprecate: logger.info,
		debug: logger.debug,
	},
	connection: async () => {
		return {
			host,
			port,
			user: username,
			password: secret,
			database: name,
			ssl: parseDbSsl(),
			connectTimeout: 5000,
			expirationChecker: () => true,
		};
	},
	pool: poolConfig(),
});

if (process.env.NODE_ENV !== 'production') {
	connection.on('query', logQuery);
}
connection.on('query-error', logQueryError);

export async function transact(fn) {
	const trx = await connection.transaction();

	try {
		const result = await fn(trx);

		await trx.commit();

		return result;
	} catch (error) {
		await trx.rollback();

		throw error;
	}
}
