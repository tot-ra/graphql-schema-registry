import { logger } from './logger';
import { connection } from './database';
import CustomSqlMigrationSource from './database/sql-migration-source';
import init from './index';

export async function warmup() {
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
