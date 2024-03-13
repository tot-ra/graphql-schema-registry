import express from 'express';
// eslint-disable-next-line new-cap
const router = express.Router();
import { json } from 'body-parser';
import { asyncWrap, cache, invalidate } from '../helpers/middleware';

import parseMiddleware from '../middleware/parse-request';
import { indexHtml, assetRouter } from './assets';
import * as schema from './schema';
import * as service from './service';
import * as persistedQuery from './persisted-queries';
import { logger } from '../logger';
import servicesModel from '../database/services';

let terminated = false;
process.on('SIGTERM', () => {
	terminated = true;
});

router.use(
	json({
		limit: '16mb',
	})
);
router.use(asyncWrap(parseMiddleware));

router.get(
	`/health`,
	asyncWrap(async (req, res) => {
		if (terminated) {
			logger.info('health check failed due to application terminating');

			return res.status(503).send('terminated');
		}

		try {
			await servicesModel.count();
		} catch (e) {
			return res.status(503).send('db not ready');
		}

		return res.status(200).send('ok');
	})
);

router.get('/', indexHtml());
assetRouter(router);

const supergraphKey = 'supergraph';

router.get('/persisted_query', asyncWrap(persistedQuery.get));
router.post('/persisted_query', asyncWrap(persistedQuery.create));

router.get('/schema/latest', asyncWrap(schema.composeLatest));
router.get(
	'/schema/supergraph',
	cache(supergraphKey),
	asyncWrap(schema.supergraph)
);
router.post('/schema/compose', asyncWrap(schema.compose));
router.post('/schema/push', invalidate(supergraphKey), asyncWrap(schema.push));
router.post('/schema/diff', asyncWrap(schema.diff));

router.delete(
	'/schema/:schemaId',
	invalidate(supergraphKey),
	asyncWrap(schema.remove)
);
router.post('/schema/validate', asyncWrap(schema.validate));

router.delete(
	'/service/:name',
	invalidate(supergraphKey),
	asyncWrap(service.remove)
);

export default router;
