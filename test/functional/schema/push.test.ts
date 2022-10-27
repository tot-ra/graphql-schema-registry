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
describe('POST /schema/push', function () {
	it('federation v2 allows same Query.property redefined by other service', async () => {
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
			uri: 'http://localhost:6001/schema/validate',
			resolveWithFullResponse: true,
			json: true,
			body: {
				name: 'service_b', // notice different service
				version: 'v1',
				type_defs: '\n\ttype Query {\n\t\thello: String\n\t}\n',
			},
		});

		expect(result.statusCode).toBe(200);
	});

	it('returns 400 if same Query.property is redefined by other service with different return type', async () => {
		const result = await request({
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
			await request({
				method: 'POST',
				uri: 'http://localhost:6001/schema/push',
				resolveWithFullResponse: true,
				json: true,
				body: {
					name: 'service_b', // notice different service
					version: 'v1',
					type_defs: '\n\ttype Query {\n\t\thello: Int\n\t}\n',
				},
			});

			// unreachable, error should be thrown
			expect(true).toBe(false);
		} catch (err) {
			expect(err.statusCode).toBe(400);
			expect(err.response.body).toEqual(
				expect.objectContaining({
					success: false,
					message: expect.stringContaining(
						'Type of field "Query.hello" is incompatible across subgraphs: it has type "String" in subgraph "service_a" but type "Int" in subgraph "service_b"'
					),
					details: [
						{
							extensions: {
								code: 'FIELD_TYPE_MISMATCH',
							},
							message: expect.stringContaining(
								'Type of field "Query.hello" is incompatible across subgraphs: it has type "String" in subgraph "service_a" but type "Int" in subgraph "service_b"'
							),
							locations: [
								{ line: 2, column: 3 },
								{ line: 2, column: 3 },
							],
						},
					],
				})
			);
		}
	});

	it('allows to register same schema from same service twice, because multiple pods can start at the same time', async () => {
		let result = await request({
			method: 'POST',
			uri: 'http://localhost:6001/schema/push',
			resolveWithFullResponse: true,
			json: true,
			body: {
				name: 'service_c',
				version: 'v1',
				type_defs: '\n\ttype Query {\n\t\tme: String\n\t}\n',
			},
		});

		expect(result.statusCode).toBe(200);

		try {
			result = await request({
				method: 'POST',
				uri: 'http://localhost:6001/schema/push',
				resolveWithFullResponse: true,
				json: true,
				body: {
					name: 'service_c',
					version: 'v1',
					type_defs: '\n\ttype Query {\n\t\tme: String\n\t}\n',
				},
			});
		} catch (err) {
			expect(err).toBe('unexpected error');
		}

		expect(result.statusCode).toBe(200);
	});

	it('returns 400 if new schema definition gets pushed with an existing version', async () => {
		const result = await request({
			method: 'POST',
			uri: 'http://localhost:6001/schema/push',
			resolveWithFullResponse: true,
			json: true,
			body: {
				name: 'service_c',
				version: 'v1',
				type_defs: '\n\ttype Query {\n\t\tme: String\n\t}\n',
			},
		});

		expect(result.statusCode).toBe(200);

		try {
			await request({
				method: 'POST',
				uri: 'http://localhost:6001/schema/push',
				resolveWithFullResponse: true,
				json: true,
				body: {
					name: 'service_c',
					version: 'v1',
					type_defs:
						'\n\ttype Query {\n\t\tme: String\n\tyou:String\n\t}\n',
				},
			});
		} catch (err) {
			expect(err.statusCode).toBe(400);
			expect(err.response.body).toEqual(
				expect.objectContaining({
					success: false,
					message: expect.stringContaining(
						'You should not register different type_defs with same version'
					),
				})
			);
		}
	});
});
