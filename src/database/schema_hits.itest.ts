import schemaHit from './schema_hits';
import { cleanTables } from '../../test/integration/database';

describe('app/database/schema_hits', () => {
	beforeEach(async () => {
		await cleanTables();
	});

	describe('syncUniqueClientsToDb', () => {
		it('add + get, no redis entry', async () => {
			await schemaHit.add({
				name: 'webapp',
				version: '123',
				entity: 'Company',
				property: 'name',
				day: '2012-01-01',
			});

			await schemaHit.syncUniqueClientsToDb();

			const result = await schemaHit.get({
				entity: 'Company',
				property: 'name',
			});

			expect(result[0]).toMatchObject({
				day: '2012-01-01',
				entity: 'Company',
				hits: '1',
				clientName: 'webapp',
				property: 'name',
			});
		});

		it('should increase hits twice after two syncs', async () => {
			const row = {
				name: 'webapp',
				version: '123',
				entity: 'Company',
				property: 'name',
				day: '2012-01-01',
			};

			await schemaHit.add(row);
			await schemaHit.syncUniqueClientsToDb();

			await schemaHit.add(row);
			await schemaHit.syncUniqueClientsToDb();

			const result = await schemaHit.get({
				entity: 'Company',
				property: 'name',
			});

			expect(result[0].hits).toEqual('2');
		});

		it('should add hits if no client/version exist', async () => {
			const row = {
				name: null,
				version: null,
				entity: 'Company',
				property: 'name',
				day: '2012-01-01',
			};

			await schemaHit.add(row);
			await schemaHit.syncUniqueClientsToDb();

			await schemaHit.add(row);
			await schemaHit.syncUniqueClientsToDb();

			const result = await schemaHit.get({
				entity: 'Company',
				property: 'name',
			});

			expect(result[0].hits).toEqual('2');
		});
	});

	describe('get', () => {
		it('should return array with one object', async () => {
			// ARRANGE
			const row = {
				name: 'webapp',
				version: '123',
				entity: 'Company',
				property: 'name',
				day: '2012-01-01',
			};

			await schemaHit.add(row);
			await schemaHit.syncUniqueClientsToDb();
			const result = await schemaHit.get({
				entity: 'Company',
				property: 'name',
			});

			// ASSERT
			expect(result).toMatchObject([
				{
					day: '2012-01-01',
					entity: 'Company',
					hits: '1',
					clientName: 'webapp',
					property: 'name',
				},
			]);
		});

		it('without redis - should aggregate hits by client name, not version', async () => {
			// ARRANGE
			const row = {
				name: 'webapp',
				version: '123',
				entity: 'Company',
				property: 'name',
				day: '2012-01-01',
			};

			await schemaHit.add({
				...row,
			});
			await schemaHit.add({
				...row,
				version: '345',
			});
			await schemaHit.syncUniqueClientsToDb();
			const result = await schemaHit.get({
				entity: 'Company',
				property: 'name',
			});

			// ASSERT
			expect(result).toMatchObject([
				{
					day: '2012-01-01',
					entity: 'Company',
					hits: '2', // !
					clientName: 'webapp',
					property: 'name',
				},
			]);
		});
	});

	describe('list', () => {
		it('returns empty array if since param was not provided', async () => {
			const result = await schemaHit.list({
				since: 0,
			});

			expect(result).toEqual([]);
		});

		it('returns two rows', async () => {
			// ARRANGE
			const row = {
				name: 'webapp',
				version: '123',
				entity: 'Company',
				property: 'name',
				day: '2012-01-01',
			};

			await schemaHit.add(row);
			await schemaHit.add(row);
			await schemaHit.add({
				...row,
				version: '345',
			});
			await schemaHit.syncUniqueClientsToDb();
			const result = await schemaHit.list({ since: 0, limit: 10 });

			// ASSERT
			expect(result[0].client_id).not.toEqual(result[1].client_id);
			expect(result[0]).toMatchObject({
				day: '2012-01-01',
				entity: 'Company',
				hits: 2,
				property: 'name',
			});
			expect(result[1]).toMatchObject({
				day: '2012-01-01',
				entity: 'Company',
				hits: 1,
				property: 'name',
			});
		});
	});

	it('deleteOlderThan', async () => {
		// ARRANGE
		const row = {
			name: 'webapp',
			version: '123',
			entity: 'Company',
			property: 'name',
			day: '2100-01-01',
		};

		await schemaHit.add({
			...row,
		});
		await schemaHit.add({
			...row,
		});
		await schemaHit.add({
			...row,
			version: '345',
			day: '2000-01-01',
		});
		await schemaHit.syncUniqueClientsToDb();

		const now = Date.now();

		await schemaHit.deleteOlderThan(now);
		const result = await schemaHit.list({ since: 0, limit: 10 });

		// ASSERT
		expect(result.length).toEqual(1);
		expect(result[0]).toMatchObject({
			day: '2100-01-01',
			entity: 'Company',
			hits: 2,
			property: 'name',
		});
	});

	it('sum', async () => {
		// ARRANGE
		const row = {
			name: 'webapp',
			version: '123',
			entity: 'Company',
			property: 'name',
			day: '2012-01-01',
		};

		await schemaHit.add(row);
		await schemaHit.add(row);
		await schemaHit.add({
			...row,
			version: '345',
		});
		await schemaHit.syncUniqueClientsToDb();
		const result = await schemaHit.sum({
			entity: 'Company',
			property: 'name',
		});

		// ASSERT
		expect(result).toEqual('3');
	});
});
