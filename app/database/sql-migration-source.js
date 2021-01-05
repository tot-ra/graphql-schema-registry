const fs = require('fs');
const path = require('path');

class CustomSqlMigrationSource {
	constructor(migrationDirectory) {
		this.migrationDirectory = migrationDirectory;
	}

	getMigrations() {
		const absoluteDir = path.resolve(process.cwd(), this.migrationDirectory);
		const files = fs.readdirSync(absoluteDir)
			.filter(f => f.endsWith(".sql"))
			.sort();

		//The Knex migrationsLister.js code assumes that migrations are returned as an array of objects each having a 'file'
		//property. Failing to do so prevents migrationsLister.js from properly printing out executed/failed migrations.
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

module.exports = CustomSqlMigrationSource;
