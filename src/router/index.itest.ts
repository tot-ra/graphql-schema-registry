import request from 'supertest';
import express from 'express';
import router from '../router';
import { cleanTables } from '../../test/integration/database';

const app = express();
app.use('/', router);

describe('app/router/supergraph', function () {
	beforeEach(async () => {
		await cleanTables();
	});

	it('push updates supergraph ', async () => {
		let res = await request(app)
			.post('/schema/push')
			.send({
				name: 'service_a',
				version: 'v1',
				type_defs: 'type Query { hello: String }',
				url: '',
			})
			.set('Accept', 'application/json');
		expect(res.statusCode).toBe(200);

		const pre = await request(app).get('/schema/supergraph');
		expect(pre.statusCode).toBe(200);

		res = await request(app)
			.post('/schema/push')
			.send({
				name: 'service_a',
				version: 'v2',
				type_defs: 'type Query { world: String }',
				url: '',
			})
			.set('Accept', 'application/json');
		expect(res.statusCode).toBe(200);

		const post = await request(app).get('/schema/supergraph');
		expect(post.statusCode).toBe(200);

		expect(pre.text).not.toBe(post.text);
	});

	it('rollback returns same supergraph', async () => {
		let old_schema = {
			name: 'service_a',
			version: 'v1',
			type_defs: 'type Query { hello: String }',
			url: '',
		};
		let res = await request(app)
			.post('/schema/push')
			.send(old_schema)
			.set('Accept', 'application/json');
		expect(res.statusCode).toBe(200);

		let pre = await request(app).get('/schema/supergraph');
		expect(res.statusCode).toBe(200);

		res = await request(app)
			.post('/schema/push')
			.send({
				name: 'service_a',
				version: 'v2',
				type_defs: 'type Query { world: String }',
				url: '',
			})
			.set('Accept', 'application/json');
		expect(res.statusCode).toBe(200);

		res = await request(app).get('/schema/supergraph');
		expect(res.statusCode).toBe(200);

		old_schema.version = 'v3';
		res = await request(app)
			.post('/schema/push')
			.send(old_schema)
			.set('Accept', 'application/json');
		expect(res.statusCode).toBe(200);

		let post = await request(app).get('/schema/supergraph');
		expect(res.statusCode).toBe(200);

		expect(pre.text).toBe(post.text);
	});

	it('invalid push returns same supergraph ', async () => {
		let res = await request(app)
			.post('/schema/push')
			.send({
				name: 'service_a',
				version: 'v1',
				type_defs: 'type Query { hello: String }',
				url: '',
			})
			.set('Accept', 'application/json');
		expect(res.statusCode).toBe(200);

		const pre = await request(app).get('/schema/supergraph');
		expect(pre.statusCode).toBe(200);

		res = await request(app)
			.post('/schema/push')
			.send({
				name: 'service_a',
				version: 'v2',
				type_defs: 'type Broken {}',
				url: '',
			})
			.set('Accept', 'application/json');
		expect(res.statusCode).toBe(500);

		const post = await request(app).get('/schema/supergraph');
		expect(post.statusCode).toBe(200);

		expect(pre.text).toBe(post.text);
	});

	it('delete schema updates supergraph ', async () => {
		let res = await request(app)
			.post('/schema/push')
			.send({
				name: 'service_a',
				version: 'v1',
				type_defs: 'type Query { hello: String }',
				url: '',
			})
			.set('Accept', 'application/json');
		expect(res.statusCode).toBe(200);
		const schemaId = res.body.data.schema_id;

		const pre = await request(app).get('/schema/supergraph');
		expect(pre.statusCode).toBe(200);

		res = await request(app).delete(`/schema/${schemaId}`);
		expect(res.statusCode).toBe(200);

		const post = await request(app).get('/schema/supergraph');
		expect(post.statusCode).toBe(200);

		expect(pre.text).not.toBe(post.text);
	});

	it('delete service updates supergraph ', async () => {
		let res = await request(app)
			.post('/schema/push')
			.send({
				name: 'service_a',
				version: 'v1',
				type_defs: 'type Query { hello: String }',
				url: '',
			})
			.set('Accept', 'application/json');
		expect(res.statusCode).toBe(200);

		const pre = await request(app).get('/schema/supergraph');
		expect(pre.statusCode).toBe(200);

		res = await request(app).delete('/service/service_a');
		expect(res.statusCode).toBe(200);

		const post = await request(app).get('/schema/supergraph');
		expect(post.statusCode).toBe(200);

		expect(pre.text).not.toBe(post.text);
	});
});
