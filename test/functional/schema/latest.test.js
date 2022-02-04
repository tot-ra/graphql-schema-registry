const request = require('request-promise');
const { reset, connect, disconnect } = require('../db');

beforeEach(async () => {
	await reset();
});
beforeAll(async () => {
	await connect();
});
afterAll(async () => {
	await disconnect();
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

	describe('With prior POST /schema/push', function () {
		it('returns registered schema after single service registration', async () => {
			let result = await request({
				method: 'POST',
				uri: 'http://localhost:6001/schema/push',
				resolveWithFullResponse: true,
				json: true,
				body: {
					name: 'service_a',
					version: 'ke9j34fuuei',
					type_defs: '\n\ttype Query {\n\t\thello: String\n\t}\n',
				},
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
					name: 'service_a',
					type_defs: '\n\ttype Query {\n\t\thello: String\n\t}\n',
					url: null,
					version: 'ke9j34fuuei',
				})
			);
		});

		it('returns registered schema after two different services registration', async () => {
			let result = await request({
				method: 'POST',
				uri: 'http://localhost:6001/schema/push',
				resolveWithFullResponse: true,
				json: true,
				body: {
					name: 'service_a',
					version: 'ke9j34fuuei',
					type_defs: '\n\ttype Query {\n\t\thello: String\n\t}\n',
				},
			});
			expect(result.statusCode).toBe(200);

			result = await request({
				method: 'POST',
				uri: 'http://localhost:6001/schema/push',
				resolveWithFullResponse: true,
				json: true,
				body: {
					name: 'service_b',
					version: 'jiaj51fu91k',
					type_defs: '\n\ttype Query {\n\t\tworld: String\n\t}\n',
				},
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
			expect(result.body.data.length).toEqual(2);
			expect(result.body.data[0]).toEqual(
				expect.objectContaining(
					{
						id: 1,
						is_active: 1,
						name: 'service_a',
						type_defs: '\n\ttype Query {\n\t\thello: String\n\t}\n',
						url: null,
						version: 'ke9j34fuuei',
					},
					{
						id: 2,
						is_active: 1,
						name: 'service_b',
						type_defs: '\n\ttype Query {\n\t\tworld: String\n\t}\n',
						url: null,
						version: 'jiaj51fu91k',
					}
				)
			);
		});
	});
});
