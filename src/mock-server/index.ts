import express from 'express';
import config from '../config';
import initServer from './server';
import { indexHtml } from '../router/assets';
import setupDev from '../setupDev';
import { logger } from '../logger';

const app = express();

app.use(express.static('dist'));

export default async function init() {
	setupDev(app);
	// eslint-disable-next-line new-cap
	const router = express.Router();
	router.get('/', indexHtml());
	router.use(express.static('dist'));
	app.use(router);

	await initServer(app);

	app.all('*', (req, res) => {
		logger.warn(`Wrong endpoint requested: ${req.url}`);

		return res.status(404).send('404 - Not found!');
	});

	app.listen(config.port, () => {
		logger.info(`Server listening on port: ${config.port}`);
	});
}

init();
