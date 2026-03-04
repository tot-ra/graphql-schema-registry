import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import knex from 'knex';

dotenv.config();

const tables = [
	'persisted_queries',
	'services',
	'schema',
	'container_schema',
	'clients',
	'clients_persisted_queries_rel',
	'schema_hit',
] as const;

const baseMysql = {
	host: process.env.MIGRATION_MYSQL_HOST || 'localhost',
	port: Number(process.env.MIGRATION_MYSQL_PORT || 3306),
	user: process.env.MIGRATION_MYSQL_USER || 'root',
	password: process.env.MIGRATION_MYSQL_PASSWORD || 'root',
	database: process.env.MIGRATION_MYSQL_DB || 'schema_registry',
};

const basePg = {
	host: process.env.MIGRATION_PG_HOST || process.env.DB_HOST || 'localhost',
	port: Number(process.env.MIGRATION_PG_PORT || process.env.DB_PORT || 5432),
	user: process.env.MIGRATION_PG_USER || process.env.DB_USERNAME || 'postgres',
	password:
		process.env.MIGRATION_PG_PASSWORD || process.env.DB_SECRET || 'postgres',
	database:
		process.env.MIGRATION_PG_DB || process.env.DB_NAME || 'schema_registry',
};

async function main() {
	const skipMigrations =
		(process.env.MIGRATION_SKIP_PG_MIGRATIONS || 'false').toLowerCase() ===
		'true';

	const mysqlConn = await mysql.createConnection(baseMysql);
	const pg = knex({
		client: 'pg',
		connection: basePg,
	});

	try {
		if (!skipMigrations) {
			console.log('Running Postgres schema migrations before data copy...');
			await pg.migrate.latest({
				directory: './migrations',
				extension: 'sql',
				disableMigrationsListValidation: true,
			});
		}

		for (const table of tables) {
			console.log(`Copying table: ${table}`);
			const [rows] = await mysqlConn.query(`SELECT * FROM \`${table}\``);
			const typedRows = rows as Record<string, any>[];

			if (typedRows.length === 0) {
				console.log('  - no rows');
				continue;
			}

			await pg.transaction(async (trx) => {
				await trx(table).delete();
				await trx.batchInsert(table, typedRows, 500);
			});

			if (Object.prototype.hasOwnProperty.call(typedRows[0], 'id')) {
				const [maxIdResult] = await pg(table).max({ maxId: 'id' });
				const maxId = maxIdResult?.maxId;
				const relationName = table === 'schema' ? '"schema"' : table;
				await pg.raw("SELECT setval(pg_get_serial_sequence(?, 'id'), ?, ?)", [
					relationName,
					maxId || 1,
					maxId !== null && typeof maxId !== 'undefined',
				]);
			}

			console.log(`  - copied ${typedRows.length} rows`);
		}

		console.log('MySQL -> Postgres data migration complete');
	} finally {
		await mysqlConn.end();
		await pg.destroy();
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
