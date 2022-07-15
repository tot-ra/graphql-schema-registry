import CustomSqlMigrationSource from './sql-migration-source';
import { assert } from 'chai';

describe('app/database/sql-migration-source.js', () => {
	it('should return available sql migrations as ordered list of objects', async () => {
		const source = new CustomSqlMigrationSource(
			'./test/unit/test-migrations'
		);

		const migrations = await source.getMigrations();

		assert.lengthOf(migrations, 2);
		assert.includeDeepOrderedMembers(
			migrations,
			[{ file: '00_test_migr1.sql' }, { file: '01_test_migr2.sql' }],
			'sql migrations should be sorted'
		);
		assert.notIncludeDeepMembers(
			migrations,
			[{ file: '02_test_migr3.js' }],
			'js based migrations should not be returned'
		);
	});

	it('should return migration as object with up and down functions', async () => {
		const source = new CustomSqlMigrationSource(
			'./test/unit/test-migrations'
		);

		const migrations = await source.getMigrations();
		const migration = await source.getMigration(migrations[0]);

		assert.isDefined(migration.up, 'migration should have an up function');
		assert.isFunction(migration.up, 'migration.up should be a function');
		assert.isDefined(
			migration.down,
			'migration should have a down function'
		);
		assert.isFunction(
			migration.down,
			'migration.down should be a function'
		);
	});
});
