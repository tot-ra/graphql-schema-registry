const express = require('express');
const logger = require('./logger');
const { get } = require('lodash');
const initGraphql = require('./graphql');

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
			setTimeout(() => monitorConnections(server), 2000);
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

// log every request to the console in dev
if (process.env.NODE_ENV !== 'production') {
	app.use(require('morgan')('dev'));
}

app.use(require('./router'));
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

	monitorConnections(server);
});

exports.init = async () => {
	if (server) {
		return server;
	}

	server = app.listen(3000, () => {
		logger.info('Server listening on port: 3000');
	});

	return server;
};
