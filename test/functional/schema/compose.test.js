const request = require('request-promise');
const { reset, connect, disconnect } = require('../db');

beforeAll(async () => {
	await connect();
});
afterAll(async () => {
	await disconnect();
});
beforeEach(async () => {
	await reset();
});

describe('POST /schema/compose', function () {
	it('returns 200 with empty body if requested service is not found', async () => {
		const result = await request({
			method: 'POST',
			uri: 'http://localhost:6001/schema/compose',
			resolveWithFullResponse: true,
			json: true,
			body: {
				services: [{ name: 'service_a', version: 'ke9j34fuuei' }],
			},
		});

		expect(result.statusCode).toBe(200);
		expect(result.body).toEqual({
			data: [],
			success: true,
		});
	});

	describe('With prior POST /schema/push', function () {
		it('returns schemas based on provided container versions, even if newer versions were registered later (assuming deploy was reverted)', async () => {
			let result = await request({
				method: 'POST',
				uri: 'http://localhost:6001/schema/push',
				resolveWithFullResponse: true,
				json: true,
				body: {
					name: 'service_a',
					version: 'v1',
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
					name: 'service_a',
					version: 'v2',
					type_defs: '\n\ttype Query {\n\t\tprivet: Int\n\t}\n',
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
					version: 'v1',
					type_defs: '\n\ttype Query {\n\t\tworld: String\n\t}\n',
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
					version: 'v2',
					type_defs: '\n\ttype Query {\n\t\tmir: String\n\t}\n',
				},
			});
			expect(result.statusCode).toBe(200);

			result = await request({
				method: 'POST',
				uri: 'http://localhost:6001/schema/compose',
				resolveWithFullResponse: true,
				json: true,
				body: {
					services: [
						{ name: 'service_a', version: 'v2' },
						{ name: 'service_b', version: 'v1' },
					],
				},
			});

			expect(result.statusCode).toBe(200);
			expect(result.body.success).toEqual(true);
			expect(result.body.data.length).toEqual(2); // notice only one item
			expect(result.body.data[0]).toEqual(
				expect.objectContaining({
					id: 2,
					is_active: 1,
					name: 'service_a',
					type_defs: '\n\ttype Query {\n\t\tprivet: Int\n\t}\n',
					version: 'v2',
				})
			);

			expect(result.body.data[1]).toEqual(
				expect.objectContaining({
					id: 3,
					is_active: 1,
					name: 'service_b',
					type_defs: '\n\ttype Query {\n\t\tworld: String\n\t}\n',
					version: 'v1',
				})
			);
		});
	});
});
