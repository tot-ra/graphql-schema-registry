import request from 'request-promise';
import { reset, connect, disconnect } from '../db';

beforeEach(async () => {
	await reset();
});
beforeAll(async () => {
	await connect();
});

afterAll(async () => {
	await disconnect();
});
describe('POST /schema/validate', function () {
	it('returns 200 if db was clean', async () => {
		const result = await request({
			method: 'POST',
			uri: 'http://localhost:6001/schema/validate',
			resolveWithFullResponse: true,
			json: true,
			body: {
				name: 'service_a',
				version: 'ke9j34fuuei',
				type_defs: '\n\ttype Query {\n\t\thello: String\n\t}\n',
			},
		});

		expect(result.statusCode).toBe(200);
		expect(result.body.success).toEqual(true);
	});

	it('returns 400 if same Query.property is attempted to be redefined by other service', async () => {
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

		try {
			result = await request({
				method: 'POST',
				uri: 'http://localhost:6001/schema/validate',
				resolveWithFullResponse: true,
				json: true,
				body: {
					name: 'service_b', // notice different service
					version: 'v1',
					type_defs: '\n\ttype Query {\n\t\thello: String\n\t}\n',
				},
			});

			// unreachable, error should be thrown
			expect(true).toBe(false);
		} catch (err) {
			expect(err.statusCode).toBe(400);
			expect(err.response.body).toEqual(
				expect.objectContaining({
					success: false,
					message: 'Field "Query.hello" can only be defined once.',
					details: [
						{
							message:
								'Field "Query.hello" can only be defined once.',
							locations: [
								{ line: 3, column: 3 },
								{ line: 3, column: 3 },
							],
						},
					],
				})
			);
		}
	});
});
