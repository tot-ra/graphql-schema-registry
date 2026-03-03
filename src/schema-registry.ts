import dotenv from 'dotenv';
import CustomSqlMigrationSource from './database/sql-migration-source';
import { connection } from './database';
import init from './index';
import { logger } from './logger';
import config from './config';
import knex from 'knex';
import { rowsFromRaw } from './database/raw-results';

dotenv.config();

process.on('unhandledRejection', (error: Error) => {
	logger.error(`unhandledRejection: ${error.message}`, {
		original_error: error,
	});
	setTimeout(() => process.exit(), 3000);
});

process.on('uncaughtException', (error: Error) => {
	logger.error(`uncaughtException: ${error.message}`, {
		original_error: error,
	});
	setTimeout(() => process.exit(), 3000);
});

logger.info(`Starting schema-registry...`);

async function createDatabaseIfNotExists() {
	const dbConfig = config.serviceDiscovery['gql-schema-registry-db'];
	const dbName = dbConfig.name;
	const dbClient = dbConfig.client || 'pg';

	const adminConnection = knex({
		client: dbClient,
		connection: {
			host: dbConfig.host,
			port: parseInt(dbConfig.port),
			user: dbConfig.username,
			password: dbConfig.secret,
			database: dbClient === 'pg' ? 'postgres' : undefined,
			connectTimeout: 5000,
		},
	});

	try {
		if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
			throw new Error(`Invalid DB_NAME value "${dbName}"`);
		}

		if (dbClient === 'pg') {
			const result = await adminConnection.raw(
				'SELECT datname FROM pg_database WHERE datname = ?',
				[dbName]
			);

			if (rowsFromRaw(result).length === 0) {
				logger.info(`Database '${dbName}' does not exist. Creating it...`);
				await adminConnection.raw(`CREATE DATABASE "${dbName}"`);
				logger.info(`Database '${dbName}' created successfully.`);
			} else {
				logger.info(`Database '${dbName}' already exists.`);
			}
		} else {
			const result = await adminConnection.raw(
				'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
				[dbName]
			);

			if (rowsFromRaw(result).length === 0) {
				logger.info(`Database '${dbName}' does not exist. Creating it...`);
				await adminConnection.raw(`CREATE DATABASE \`${dbName}\``);
				logger.info(`Database '${dbName}' created successfully.`);
			} else {
				logger.info(`Database '${dbName}' already exists.`);
			}
		}
	} catch (error) {
		logger.error(`Failed to create database: ${error.message}`);
		throw error;
	} finally {
		await adminConnection.destroy();
	}
}

async function warmup() {
	logger.info('Warming up');
	logger.info(
		`Looking for environment variable DB_EXECUTE_MIGRATIONS  = ${process.env.DB_EXECUTE_MIGRATIONS}`
	);

	const executeMigrations = (
		process.env.DB_EXECUTE_MIGRATIONS || 'true'
	).trim();

	logger.info(`Will execute DB migrations? ${executeMigrations}`);

	try {
		if (executeMigrations === 'true') {
			await createDatabaseIfNotExists();
			await connection.migrate.latest({
				migrationSource: new CustomSqlMigrationSource('./migrations'),
				disableMigrationsListValidation: true,
			});
		}

		await init();

		logger.info('Warm up complete');
	} catch (error) {
		logger.error(`Service failed to warm up: ${error.message}`, {
			original_error: error,
		});

		setTimeout(() => warmup(), 10000);
	}
}

warmup();
