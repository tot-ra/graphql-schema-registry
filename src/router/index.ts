import express from 'express';
// eslint-disable-next-line new-cap
const router = express.Router();
import { json } from 'body-parser';
import { asyncWrap } from '../helpers/middleware';

import parseMiddleware from '../middleware/parse-request';
import { indexHtml, assetRouter } from './assets';
import * as schema from './schema';
import * as service from './service';
import * as persistedQuery from './persisted-queries';

router.use(
	json({
		limit: '16mb',
	})
);
router.use(asyncWrap(parseMiddleware));

router.get('/', indexHtml());
assetRouter(router);

router.get('/persisted_query', asyncWrap(persistedQuery.get));
router.post('/persisted_query', asyncWrap(persistedQuery.create));

router.get('/schema/latest', asyncWrap(schema.composeLatest));
router.post('/schema/compose', asyncWrap(schema.compose));
router.post('/schema/push', asyncWrap(schema.push));
router.post('/schema/diff', asyncWrap(schema.diff));

router.delete('/schema/:schemaId', asyncWrap(schema.remove));
router.post('/schema/validate', asyncWrap(schema.validate));

router.delete('/service/:name', asyncWrap(service.remove));

export default router;
