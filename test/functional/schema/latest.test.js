const request = require('request-promise');
const { db, connect, reset, disconnect } = require('../db');

beforeAll(async () => {
	await connect();
});

afterAll(async () => {
	await disconnect();
});

beforeEach(async () => {
	await reset();
});

describe('GET /schema/latest', function () {
	it('returns 200 with empty body', async () => {
		const result = await request({
			method: 'GET',
			uri: 'http://localhost:6001/schema/latest',
			resolveWithFullResponse: true,
			json: true,
		});

		expect(result.statusCode).toBe(200);
		expect(result.body).toEqual({
			data: [],
			success: true,
		});
	});

	it('returns registered schema after POST /schema/push', async () => {
		let result = await request({
			method: 'POST',
			uri: 'http://localhost:6001/schema/push',
			resolveWithFullResponse: true,
			json: true,
			body: {
				"name": "service_a",
				"version": "ke9j34fuuei",
				"type_defs": "\n\ttype Query {\n\t\thello: String\n\t}\n"
			}
		});
		expect(result.statusCode).toBe(200);

		result = await request({
			method: 'GET',
			uri: 'http://localhost:6001/schema/latest',
			resolveWithFullResponse: true,
			json: true,
		});

		expect(result.statusCode).toBe(200);
		expect(result.body.success).toEqual(true);
		expect(result.body.data.length).toEqual(1);
		expect(result.body.data[0]).toEqual(
			expect.objectContaining({
				id: 1,
				is_active: 1,
				name: "service_a",
				type_defs: "\n\ttype Query {\n\t\thello: String\n\t}\n",
				url: null,
				version: "ke9j34fuuei"
			})
		);
	});
});
