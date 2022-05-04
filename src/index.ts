import express from 'express';
import { get } from 'lodash';
import initGraphql from './graphql';
import * as kafka from './kafka';
import config from './config';
import router from './router';
import { logger } from "./logger";

const app = express();

let server = null;
let terminated = false;

function monitorConnections() {
	if (!server) {
		return null;
	}

	server.getConnections((error, count) => {
		if (error) {
			logger.info(error, `Error occured while getting connections`);
		}

		logger.info(`Process shutting down with ${count} open connections\n`);

		if (count > 0) {
			setTimeout(() => monitorConnections(), 2000);
		}
	});
}

app.get(`/health`, (req, res) => {
	if (terminated) {
		logger.info('health check failed due to application terminating');

		return res.status(429).send('terminated');
	}

	return res.status(200).send('ok');
});

app.use(router);
initGraphql(app);

// eslint-disable-next-line
app.use((err, req, res, next) => {
	// NOSONAR - Don't remove the next argument!!!
	const errorDetails = {
		correlationId: get(req, 'correlationId', null),
		url: req.url,
	};

	if (err.isJoi || err.isDisplayedToUser) {
		logger.warn(err, errorDetails);

		return res.status(err.statusCode || 400).json({
			success: false,
			message: get(err, 'details[0].message') || err.message,
			details: get(err, 'details') || null,
		});
	}

	logger.error(`A server error occurred: ${err.message}`, {
		original_error: err,
		...errorDetails,
	});

	return res
		.status(500)
		.end(
			'Whoops! Something broke in our servers and we cannot serve you this page at the moment.'
		);
});

app.all('*', (req, res) => {
	logger.warn(`Wrong endpoint requested: ${req.url}`);

	return res.status(404).send('404 - Not found!');
});

process.on('SIGTERM', () => {
	terminated = true;

	if (!server) {
		return null;
	}

	logger.info('Starting server shutdown.');

	setTimeout(() => {
		server.close(() => {
			logger.info('Server shutdown complete. Exiting process.');
			setTimeout(() => process.exit(0), 1000);
		});
	}, 19 * 1000);

	monitorConnections();
});

export default async function init() {
	if (server) {
		return server;
	}

	if (config.asyncSchemaUpdates) {
		kafka.init();
	}

	server = app.listen(config.port, () => {
		logger.info(`Server listening on port: ${config.port}`);
	});

	return server;
};
