import schemaModel from './schema';
import knex, { cleanTables } from '../../test/integration/database';

describe('app/database/schema', () => {
	beforeEach(async () => {
		await cleanTables();
	});

	it('listMigrateableSchemas - lists only schemas without UUID', async () => {
		await knex('services').insert({
			id: 1,
			name: 'test-service',
		});

		await knex('schema').insert({
			service_id: 1,
			type_defs: `type UserA1 { name: String }`,
		});

		await knex('schema').insert({
			service_id: 1,
			type_defs: `type UserA2 { name: String }`,
			UUID: 'asd',
		});

		const result = await schemaModel.listMigrateableSchemas(knex);

		expect(result.length).toEqual(1);

		expect(result[0]).toMatchObject({
			type_defs: 'type UserA1 { name: String }',
		});
	});

	it('addUUIDToAllEntities', async () => {
		await knex('services').insert({
			id: 1,
			name: 'test-service',
		});

		await knex('schema').insert({
			service_id: 1,
			type_defs: `type UserA1 { name: String }`,
		});

		await knex('schema').insert({
			service_id: 1,
			type_defs: `type UserA2 { name: String }`,
			UUID: 'asd',
		});

		await knex('schema').insert({
			service_id: 1,
			type_defs: `type UserA3 { name: String }`,
		});

		const result = await schemaModel.listMigrateableSchemas(knex);
		expect(result.length).toEqual(2);

		await schemaModel.addUUIDToAllSchemas(knex, 1);

		const result2 = await schemaModel.listMigrateableSchemas(knex);
		expect(result2.length).toEqual(0);
	});
});
