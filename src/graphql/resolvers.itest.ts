import resolvers from './resolvers';
import knex, { cleanTables } from '../../test/integration/database';

import clientsModel from '../database/clients';
import servicesModel, { ServiceRecord } from '../database/services';
import schemaModel from '../database/schema';
import dataloader from '../graphql/dataloader';
import { Knex } from 'knex';

describe('app/graphql', () => {
	beforeEach(async () => {
		await cleanTables();
	});

	describe('POST /graphql', () => {
		describe('Query { services } ', () => {
			it('returns empty set', async () => {
				const result = await resolvers.Query.services(null, {
					limit: 10,
					offset: 0,
				});

				expect(result).toEqual([]);
			});

			it('returns two services', async () => {
				// ARRANGE
				await servicesModel.insertService(knex, 'service_a', '');
				await servicesModel.insertService(knex, 'service_b', '');

				// ACT
				const result = await resolvers.Query.services(null, {
					limit: 10,
					offset: 0,
				});

				// ASSERT
				expect(result).toMatchObject([
					{ name: 'service_a' },
					{ name: 'service_b' },
				]);
			});
		});

		describe('Query { service } ', () => {
			it('returns null', async () => {
				const result = await resolvers.Query.service(
					null,
					{ id: 1 },
					{ dataloaders: dataloader(knex) }
				);

				expect(result).toEqual(null);
			});

			it('returns a service', async () => {
				// ARRANGE
				const addedService = await servicesModel.insertService(
					knex,
					'service_a',
					''
				);

				// ACT
				const result = await resolvers.Query.service(
					null,
					{ id: addedService.id },
					{ dataloaders: dataloader(knex) }
				);

				// ASSERT
				expect(result).toMatchObject({ name: 'service_a' });
			});
		});

		describe('Query { serviceCount } ', () => {
			it('returns empty set', async () => {
				const result = await resolvers.Query.serviceCount();

				expect(result).toEqual(0);
			});

			it('returns two services', async () => {
				// ARRANGE
				await servicesModel.insertService(knex, 'service_a', '');
				await servicesModel.insertService(knex, 'service_b', '');

				// ACT
				const result = await resolvers.Query.serviceCount();

				// ASSERT
				expect(result).toEqual(2);
			});
		});

		describe('Query { schema } ', () => {
			it('returns empty set', async () => {
				const result = await resolvers.Query.schema(null, { id: 1 });

				expect(result).toEqual(null);
			});

			it('returns two services', async () => {
				// ARRANGE
				await servicesModel.insertService(
					knex as Knex<ServiceRecord>,
					'service_a',
					''
				);
				const addedSchema = await schemaModel.registerSchema({
					trx: knex,
					service: {
						name: 'service_a',
						version: '1.0',
						url: 'http://localhost:8080/graphql',
						type_defs: 'type Query { default: String }',
					},
				});

				// ACT
				const result = await resolvers.Query.schema(null, {
					id: addedSchema.schema_id,
				});

				// ASSERT
				expect(Object.keys(result)).toEqual([
					'id',
					'service_id',
					'is_active',
					'type_defs',
					'added_time',
					'updated_time',
					'characters',
				]);
				expect(result).toMatchObject({
					type_defs: 'type Query { default: String }',
				});
			});
		});

		describe('Query { clients } ', () => {
			it('returns empty set', async () => {
				const result = await resolvers.Query.clients();

				expect(result).toEqual([]);
			});

			it('returns two clients', async () => {
				// ARRANGE
				clientsModel.add({
					name: 'client_a',
					version: 'v1',
					persistedQueryHash: 'abc',
				});
				clientsModel.add({
					name: 'client_b',
					version: 'v2',
					persistedQueryHash: 'def',
				});
				await clientsModel.syncUniqueClientsToDb();

				// ACT
				const result = await resolvers.Query.clients();

				// ASSERT
				expect(result).toEqual([
					{ name: 'client_a' },
					{ name: 'client_b' },
				]);
			});
		});
	});
});
