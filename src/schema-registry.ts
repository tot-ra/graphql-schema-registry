import dotenv from 'dotenv';
import { logger } from './logger';
import { warmup } from './start';

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

warmup();
