import { createLogger, transports, format } from 'winston';
import RedisTransport from 'winston-redis-stream';
import config from './config';

const logTransports = [new transports.Console()];

if (config.logStreamingEnabled) {
	try {
		const redis = new RedisTransport({
			redis: {
				host: process.env.REDIS_HOST,
				port: process.env.REDIS_PORT,
				password: process.env.REDIS_SECRET,
			},
			channel: 'logs',
		});
		logTransports.push(redis);
	} catch (e) {
		console.error(e);
	}
}

export const logger = createLogger({
	level: process.env.LOG_LEVEL || 'info',
	transports: logTransports,
	format:
		process.env.LOG_TYPE === 'json'
			? buildJsonFormat()
			: buildPrettyFormat(),
});

function buildPrettyFormat() {
	return format.combine(
		format.errors({ stack: true }),
		format.colorize(),
		format.timestamp(),
		format.printf(({ timestamp, level, message, stack }) => {
			if (stack) {
				return `[${timestamp}] ${level}: ${message} ${stack}`;
			}
			return `[${timestamp}] ${level}: ${message}`;
		})
	);
}

function buildJsonFormat() {
	return format.json();
}

logger.exitOnError = false;
