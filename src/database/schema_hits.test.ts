import { assert } from 'chai';

const mockLogger = {
	info: jest.fn(),
	warn: jest.fn(),
	error: jest.fn(),
	debug: jest.fn(),
};

jest.mock('../logger', () => ({
	logger: mockLogger,
}));

import objectUnderTest from './schema_hits';

describe('app/database/schema_hits.js', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('add()', () => {
		it('should increase hits to 2', async () => {
			await objectUnderTest.add({
				name: 'xxx',
				version: 'xxx',
				entity: 'User',
				property: 'id',
				day: '2021-01-01',
			});
			await objectUnderTest.add({
				name: 'xxx',
				version: 'xxx',
				entity: 'User',
				property: 'id',
				day: '2021-01-01',
			});

			assert.deepEqual(objectUnderTest.internalCache[0].hits, 2);
		});

		it('should increase hits to 2, if name/version is null', async () => {
			await objectUnderTest.add({
				name: null,
				version: null,
				entity: 'User',
				property: 'id',
				day: '2021-01-01',
			});
			await objectUnderTest.add({
				name: null,
				version: null,
				entity: 'User',
				property: 'id',
				day: '2021-01-01',
			});

			assert.deepEqual(objectUnderTest.internalCache[0].hits, 2);
		});
	});
});
