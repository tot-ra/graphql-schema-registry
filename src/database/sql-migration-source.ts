import fs from 'fs';
import path from 'path';
import { Knex } from 'knex';

class CustomSqlMigrationSource implements Knex.MigrationSource<any> {
	migrationDirectory: string;

	constructor(migrationDirectory: string) {
		this.migrationDirectory = migrationDirectory;
	}

	getMigrations() {
		const absoluteDir = path.resolve(
			process.cwd(),
			this.migrationDirectory
		);
		const files = fs
			.readdirSync(absoluteDir)
			.filter((f) => f.endsWith('.sql'))
			.sort();

		// The Knex migrationsLister.js code assumes that migrations are returned as an array of objects each having a 'file'
		// property. Failing to do so prevents migrationsLister.js from properly printing out executed/failed migrations.
		const transformed = files.reduce((acc, file) => {
			acc.push({ file });
			return acc;
		}, []);

		return Promise.resolve(transformed);
	}

	getMigrationName(migration: any) {
		return migration.file;
	}

	async getMigration(migration: any): Promise<Knex.Migration> {
		const migrationPath = path.resolve(
			process.cwd(),
			this.migrationDirectory,
			this.getMigrationName(migration)
		);

		return {
			up: async function up(knex: any) {
				const sql = fs.readFileSync(migrationPath, 'utf8');

				return knex.raw(sql);
			},
			down: async function down() {
				// noop
			},
		};
	}
}

export default CustomSqlMigrationSource;
