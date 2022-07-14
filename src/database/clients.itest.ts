import clients from './clients';
import { cleanTables } from '../../test/integration/database';

describe('app/database/clients', () => {
	beforeEach(async () => {
		await cleanTables();
	});

	describe('syncUniqueClientsToDb', () => {
		it('add webapp + getClients should return webapp', async () => {
			clients.add({
				name: 'webapp',
				version: '1',
				persistedQueryHash: '',
			});
			await clients.syncUniqueClientsToDb();

			const result = await clients.getClients();

			expect(result[0]).toMatchObject({
				name: 'webapp',
			});
		});

		it('add webapp 1, 2 + getVersions should return two versions', async () => {
			clients.add({
				name: 'webapp',
				version: '1',
				persistedQueryHash: '',
			});

			clients.add({
				name: 'webapp',
				version: '2',
				persistedQueryHash: '',
			});
			await clients.syncUniqueClientsToDb();

			const result = await clients.getVersions('webapp');

			expect(result[0]).toMatchObject({
				version: '1',
			});
			expect(result[1]).toMatchObject({
				version: '2',
			});
		});
	});
});
