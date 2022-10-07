import { createLogger, transports, format } from 'winston';
import RedisTransport from 'winston-redis-stream';

export const logger = createLogger({
	level: process.env.LOG_LEVEL || 'info',
	transports: [
		new transports.Console(),
		new RedisTransport({
			host: process.env.REDIS_HOST,
			port: process.env.REDIS_PORT,
			channel: 'logs',
		}),
	],
	format:
		process.env.LOG_TYPE === 'json'
			? buildJsonFormat()
			: buildPrettyFormat(),
});

function buildPrettyFormat() {
	return format.combine(
		format.colorize(),
		format.timestamp(),
		format.printf(({ timestamp, level, message, stack }) => {
			return `[${timestamp}] ${level}: ${message} ${stack}`;
		})
	);
}

function buildJsonFormat() {
	return format.json();
}

logger.exitOnError = false;
