const diplomat = require('../diplomat');
const logger = require('../logger');

const DB_SCHEMA_REGISTRY =
	process.env.DB_SCHEMA_REGISTRY || 'gql-schema-registry-db';
const knex = require('knex');

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

const connection = knex({
	client: 'mysql2',
	log: {
		warn: logger.info,
		error: logger.error,
		deprecate: logger.info,
		debug: logger.debug,
	},
	connection: async () => {
		const {
			host,
			port,
			username,
			secret,
			name,
		} = await diplomat.getServiceInstance(DB_SCHEMA_REGISTRY);

		logger.info(`connecting to DB ${host}:${port}`);

		return {
			host,
			port,
			user: username,
			password: secret,
			database: name,
			connectTimeout: 5000,
			expirationChecker: () => true,
		};
	},
});

connection.on('query', logQuery);
connection.on('query-error', logQueryError);

exports.knex = connection;

exports.transact = async (fn) => {
	const trx = await exports.knex.transaction();

	try {
		const result = await fn(trx);

		await trx.commit();

		return result;
	} catch (error) {
		await trx.rollback();

		throw error;
	}
};
