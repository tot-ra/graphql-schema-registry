import { assert } from 'chai';
import sinon from 'sinon';

const mockLogger = {
	debug: sinon.stub(),
};

import objectUnderTest from './schema';

describe('app/database/schema.js', () => {
	let knexMock;

	beforeEach(() => {
		knexMock = {
			raw: sinon.spy(),
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
		sinon.reset();
	});

	describe('getLatestSchemaByServices()', () => {
		it('should pick version with higher added_time', async () => {
			const correctVersion = {
				id: 2,
				service_id: 1,
				type_defs: 'x',
				version: 'a1',
				added_time: '2020-02-02T10:00:00.000Z',
				is_active: 1,
				name: 'xxx',
				url: 'xxx',
			};

			knexMock.raw = async () => [
				[
					{
						id: 1,
						service_id: 1,
						type_defs: 'y',
						version: 'a1',
						added_time: '2020-01-01T09:00:00.000Z',
						is_active: 1,
						name: 'xxx',
						url: 'xxx',
					},
					correctVersion,
				],
			];
			const result = await objectUnderTest.getSchemaLastUpdated({
				trx: knexMock,
				services: ['xxx'],
			});

			assert.deepEqual(result, [correctVersion]);
		});

		it('should pick version with higher id, if added_time is the same', async () => {
			const time = '2020-01-03T17:36:49.000Z';
			const correctVersion = {
				id: 2,
				service_id: 1,
				type_defs: 'x',
				version: 'a1',
				added_time: time,
				is_active: 1,
				name: 'xxx',
				url: 'xxx',
			};

			knexMock.raw = async () => [
				[
					{
						id: 1,
						service_id: 1,
						type_defs: 'x',
						version: 'a1',
						added_time: time,
						is_active: 1,
						name: 'xxx',
						url: 'xxx',
					},
					correctVersion,
				],
			];
			const result = await objectUnderTest.getSchemaLastUpdated({
				trx: knexMock,
				services: ['xxx'],
			});

			assert.deepEqual(result, [correctVersion]);
		});

		describe('edge cases', () => {
			it('should return [] if no service names were passed', async () => {
				const result = await objectUnderTest.getSchemaLastUpdated({
					trx: knexMock,
					services: [],
				});

				assert.deepEqual(result, []);
			});

			it('should return [] if nothing in db returns []', async () => {
				knexMock.raw = async () => [];
				const result = await objectUnderTest.getSchemaLastUpdated({
					trx: knexMock,
					services: ['xxx'],
				});

				assert.deepEqual(result, []);
			});

			it('should return [] if nothing in db returns [[]]', async () => {
				knexMock.raw = async () => [[]];
				const result = await objectUnderTest.getSchemaLastUpdated({
					trx: knexMock,
					services: ['xxx'],
				});

				assert.deepEqual(result, []);
			});

			it('should return [] if nothing in db returns null', async () => {
				knexMock.raw = async () => null;
				const result = await objectUnderTest.getSchemaLastUpdated({
					trx: knexMock,
					services: ['xxx'],
				});

				assert.deepEqual(result, []);
			});
		});
	});
});
