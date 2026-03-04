const diplomat = require('./app/diplomat');
const CustomSqlMigrationSource = require('./app/database/sql-migration-source');

const DB_SCHEMA_REGISTRY =
	process.env.DB_SCHEMA_REGISTRY || 'gql-schema-registry-db';
const { client, host, port, username, secret, name } =
	diplomat.default.getServiceInstance(DB_SCHEMA_REGISTRY);

function booleanFor(variable, defaultValue = 'false') {
	return (variable || defaultValue).toLowerCase() === 'true';
}

function parseDbSsl() {
	if (!booleanFor(process.env.DB_SSL)) {
		return undefined;
	}

	const ssl = {
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

module.exports = {
	client: client,
	connection: {
		host: host,
		port: port,
		database: name,
		user: username,
		password: secret,
		ssl: parseDbSsl(),
	},
	migrations: {
		//Required to prevent Knex from complaining that the original js based migrations are not found by CustomSqlMigrationSource
		disableMigrationsListValidation: true,
		migrationSource: new CustomSqlMigrationSource.default('./migrations'),
		//Required for generating new migrations
		extension: 'sql',
	},
};
