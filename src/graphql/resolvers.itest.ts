import resolvers from './resolvers';
import { cleanTables } from '../../test/integration/database';

import clientsModel from '../database/clients';

describe('app/graphql', () => {
	beforeEach(async () => {
		await cleanTables();
	});

	describe('POST /graphql', () => {
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
