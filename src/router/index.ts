import express from 'express';
const router = express.Router();
import { json } from 'body-parser';
import { asyncWrap } from '../helpers/middleware';

import * as assets from './assets';
import * as schema from './schema';
import * as service from './service';
import * as persistedQuery from './persisted-queries';

router.use(
	json({
		limit: '16mb',
	})
);
router.use(asyncWrap(require('../middleware/parse-request')));

router.get('/', assets.indexHtml());
assets.router(router);

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
