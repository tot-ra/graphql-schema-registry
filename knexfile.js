const diplomat = require('./app/diplomat')
const path = require('path');
const fs = require('fs');

const DB_SCHEMA_REGISTRY = process.env.DB_SCHEMA_REGISTRY || 'gql-schema-registry-db';
const {
	client,
	host,
	port,
	username,
	secret,
	name,
} = diplomat.getServiceInstance(DB_SCHEMA_REGISTRY);

class CustomSqlMigrationSource {
	constructor(migrationDirectory) {
		this.migrationDirectory = migrationDirectory;
	}

	getMigrations() {
		const absoluteDir = path.resolve(process.cwd(), this.migrationDirectory);
		const files = fs.readdirSync(absoluteDir)
			.filter(f => f.endsWith(".sql"))
			.sort();

		//The Knex migrationsLister.js code assumes that migrations are returned as an array of objects each having
		//a 'file' property.
		const transformed = files.reduce((acc, file) => {
			acc.push({ file: file })
			return acc;
		}, []);

		return Promise.resolve(transformed);
	}

	getMigrationName(migration) {
		return migration.file;
	}

	getMigration(migration) {
		const migrationPath = path.resolve(process.cwd(), this.migrationDirectory, this.getMigrationName(migration));

		return {
			up: async function up(knex) {
				const sql = fs.readFileSync(migrationPath, 'utf8');

				return knex.raw(sql);
			},
			down: async function down(knex) {
				//noop
			}
		}
	}
}

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
