import dotenv from 'dotenv';
import CustomSqlMigrationSource from './database/sql-migration-source';
import { connection } from './database';
import init from './index';
import { logger } from "./logger";

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
