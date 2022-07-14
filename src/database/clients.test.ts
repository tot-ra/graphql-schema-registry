import { assert } from 'chai';

import objectUnderTest from './clients';

describe('app/database/clients.js', () => {
	beforeEach(() => {
		objectUnderTest.internalCache = {};
	});

	it('clientsModel.add() should fill internalCache', async () => {
		// ACT
		await objectUnderTest.add({
			name: 'name',
			version: 'version',
			persistedQueryHash: 'hash',
		});

		// ASSERT
		const expected = { name: { version: { persistedQueries: ['hash'] } } };
		const result = objectUnderTest.internalCache;

		assert.deepEqual(result, expected);
	});

	it('clientsModel.add() + .getFlatClients() should return flat array for DB insertion', async () => {
		// ACT
		await objectUnderTest.add({
			name: 'name',
			version: 'version',
			persistedQueryHash: 'aaa',
		});
		await objectUnderTest.add({
			name: 'name',
			version: 'version',
			persistedQueryHash: 'bbb',
		});
		await objectUnderTest.add({
			name: 'name',
			version: 'version2',
			persistedQueryHash: 'ccc',
		});

		// ASSERT
		const result = objectUnderTest.getFlatClients(
			objectUnderTest.internalCache
		);
		const expected = [
			{
				name: 'name',
				persistedQueries: ['aaa', 'bbb'],
				version: 'version',
			},
			{ name: 'name', persistedQueries: ['ccc'], version: 'version2' },
		];

		assert.deepEqual(result, expected);
	});
});
