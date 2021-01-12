const diplomat = require('./app/diplomat')
const CustomSqlMigrationSource = require('./app/database/sql-migration-source');

const DB_SCHEMA_REGISTRY = process.env.DB_SCHEMA_REGISTRY || 'gql-schema-registry-db';
const {
	client,
	host,
	port,
	username,
	secret,
	name,
} = diplomat.getServiceInstance(DB_SCHEMA_REGISTRY);

module.exports = {
	client: client,
	connection: {
		host: host,
		port: port,
		database: name,
		user: username,
		password: secret,
		multipleStatements: true,
	},
	migrations: {
		//Required to prevent Knex from complaining that the original js based migrations are not found by CustomSqlMigrationSource
		disableMigrationsListValidation: true,
		migrationSource: new CustomSqlMigrationSource('./migrations'),
		//Required for generating new migrations
		extension: 'sql',
	}
};
