import { composeLatest, push, supergraph } from '../router/schema';
import { cleanTables } from '../../test/integration/database';

describe('app/controller/schema', () => {
	beforeEach(async () => {
		await cleanTables();
	});

	const res = {
		json: (x) => x,
		send: (x) => x,
		headers: {},
		set: function (key, value) {
			this.headers[key] = value;
			return this;
		},
	};

	describe('GET /schema/latest', () => {
		it('returns empty object if no schemas/services are registered', async () => {
			const req = {};

			const result = await composeLatest(req, res);

			expect(result).toEqual({
				data: [],
				success: true,
			});
		});
	});

	describe('POST /schema/push', () => {
		it('registers schema (with empty url)', async () => {
			const req = {
				body: {
					name: 'service_a',
					version: 'v1',
					type_defs: 'type Query { hello: String }',
					url: '',
				},
			};

			const result = await push(req, res);
			expect(result.success).toEqual(true);

			const result2 = await composeLatest({}, res);

			expect(result2.data[0]).toMatchObject({
				is_active: 1,
				name: 'service_a',
				type_defs: `type Query {
  hello: String
}`,
				url: '',
				version: 'v1',
			});
		});

		it('registers second version of schema', async () => {
			let result = await push(
				{
					body: {
						name: 'service_a',
						version: 'v1',
						type_defs: 'type Query { hello: String }',
						url: '',
					},
				},
				res
			);
			expect(result.success).toEqual(true);

			result = await push(
				{
					body: {
						name: 'service_a',
						version: 'v2',
						type_defs: `type Query { world: String }`,
						url: '',
					},
				},
				res
			);
			expect(result.success).toEqual(true);

			const result2 = await composeLatest({}, res);

			expect(result2.data[0]).toMatchObject({
				is_active: 1,
				name: 'service_a',
				type_defs: `type Query {
  world: String
}`,
				url: '',
				version: 'v2',
			});
		});

		it('schema is case sensitive', async () => {
			let result = await push(
				{
					body: {
						name: 'service_a',
						version: 'v1',
						type_defs:
							'type MyType { id: String} type Query { my: MyType }',
						url: '',
					},
				},
				res
			);
			expect(result.success).toEqual(true);

			result = await push(
				{
					body: {
						name: 'service_a',
						version: 'v2',
						type_defs:
							'type MyType { Id: String another: String } type Query { my: MyType }',
						url: '',
					},
				},
				res
			);
			expect(result.success).toEqual(true);

			const result2 = await composeLatest({}, res);

			expect(result2.data[0]).toMatchObject({
				is_active: 1,
				name: 'service_a',
				type_defs: `type MyType {
  Id: String
  another: String
}

type Query {
  my: MyType
}`,
				url: '',
				version: 'v2',
			});
		});

		it('re-registers schema without errors if version name is "latest"', async () => {
			let result = await push(
				{
					body: {
						name: 'service_b',
						version: 'latest',
						type_defs: 'type Query { hello: String }',
						url: '',
					},
				},
				res
			);
			expect(result.success).toEqual(true);

			result = await push(
				{
					body: {
						name: 'service_b',
						version: 'latest', // !
						type_defs: `type Query { world: String }`,
						url: '',
					},
				},
				res
			);
			expect(result.success).toEqual(true);

			const result2 = await composeLatest({}, res);

			expect(result2.data[0]).toMatchObject({
				is_active: 1,
				name: 'service_b',
				type_defs: `type Query {
  world: String
}`,
				url: '',
				version: 'latest',
			});
		});

		describe('edge cases', () => {
			it('requires name', async () => {
				const req = {
					body: {
						name: '',
						version: '',
						type_defs: '',
						url: '',
					},
				};

				try {
					await push(req, res);
					expect(false).toEqual(true);
				} catch (e) {
					expect(e.message).toEqual(
						'"name" is not allowed to be empty'
					);
				}
			});

			it('requires version', async () => {
				const req = {
					body: {
						name: 'service_a',
						version: '',
						type_defs: '',
						url: '',
					},
				};

				try {
					await push(req, res);
					expect(false).toEqual(true);
				} catch (e) {
					expect(e.message).toEqual(
						'"version" is not allowed to be empty'
					);
				}
			});

			it('requires type_defs', async () => {
				const req = {
					body: {
						name: 'service_a',
						version: 'v1',
						type_defs: '',
						url: '',
					},
				};

				try {
					await push(req, res);
					expect(false).toEqual(true);
				} catch (e) {
					expect(e.message).toEqual(
						'"type_defs" is not allowed to be empty'
					);
				}
			});

			it('fails if same version is attempted', async () => {
				let result = await push(
					{
						body: {
							name: 'service_a',
							version: 'v1',
							type_defs: 'type Query { hello: String }',
							url: '',
						},
					},
					res
				);
				expect(result.success).toEqual(true);

				try {
					result = await push(
						{
							body: {
								name: 'service_a',
								version: 'v1', // !!
								type_defs: 'type Query { world: String }',
								url: '',
							},
						},
						res
					);
					expect(false).toEqual(true);
				} catch (e) {
					expect(e.message).toEqual(
						'Schema [service_a] and version [v1] already exist in registry. You should not register different type_defs with same version.'
					);
				}
			});

			it('fails if type B with @extends has no base service', async () => {
				try {
					await push(
						{
							body: {
								name: 'service_a',
								version: 'v1',
								type_defs: `
					type Query { hello: String }
					type A @key(fields: "id") { id: String\n a: String }
					type B @key(fields: "id") @extends { id: String @external\n a: String }
					`,
							},
						},
						res
					);
				} catch (e) {
					expect(e.message).toEqual('Schema validation failed');
				}
			});
		});
	});

	describe('GET /schema/supergraph', () => {
		it('register 2 schemas and returns composition', async () => {
			let result = await push(
				{
					body: {
						name: 'service_a',
						version: 'v1',
						type_defs: 'type Query { hello: String }',
						url: '',
					},
				},
				res
			);
			expect(result.success).toEqual(true);

			result = await push(
				{
					body: {
						name: 'service_b',
						version: 'v1',
						type_defs: 'type Query { world: String }',
						url: '',
					},
				},
				res
			);
			expect(result.success).toEqual(true);

			result = await supergraph({}, res);

			expect(result).toEqual(
				expect.stringContaining(`type Query
  @join__type(graph: SERVICE_A)
  @join__type(graph: SERVICE_B)
{
  hello: String @join__field(graph: SERVICE_A)
  world: String @join__field(graph: SERVICE_B)
}`)
			);
		});
	});
});
