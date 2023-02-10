import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Then, DataTable, Given, Before } from '@cucumber/cucumber';
import expect from 'expect';
import { getTimestamp } from '../../../src/helpers/clientUsage/redisHelpers';
import { redisDataPath } from '../config/config';

let redisWrapper;

async function getConnection() {
	if (!redisWrapper) {
		const { default: redis } = await import('../../../src/redis');
		redisWrapper = redis;
	}
	return redisWrapper;
}

Before(async () => {
	const redis = await getConnection();
	await redis.flush();
});

Given('the redis contains the keys:', async (dataTable: DataTable) => {
	const redisWrapper = await getConnection();

	const keys = dataTable.rowsHash();
	const promises = [];
	for (const key in keys) {
		promises.push(
			redisWrapper.set(
				key.replace(
					'{{DATE_NOW_PLACEHOLDER}}',
					getTimestamp().toString()
				),
				keys[key],
				1000
			)
		);
	}
	await Promise.all(promises);
});

Given(
	'the redis has the key {string} with value as in file {string}',
	async (key, file) => {
		const redisWrapper = await getConnection();
		const fileContent = readFileSync(resolve(redisDataPath, file), 'utf8');

		await redisWrapper.set(key, fileContent, 1000);
	}
);

Then(
	'the redis must contain an {string} key for root field {int} with value {int}',
	async (
		entryType: 'error' | 'success',
		rootFieldId: number,
		expectedValue: number
	) => {
		const redisWrapper = await getConnection();
		const keys = await redisWrapper.keys(
			`root_field_${rootFieldId}_*_${entryType}`
		);
		try {
			expect(keys).toHaveLength(1);
		} catch (error) {
			console.log({ keys });
			throw error;
		}
		const value = Number(await redisWrapper.get(keys[0]));
		expect(value).toEqual(expectedValue);
	}
);

Then(
	'{int} {string} registered for root field {int}',
	async (
		expectedValue: number,
		entryType: 'error' | 'success',
		rootFieldId: number
	) => {
		const redisWrapper = await getConnection();

		const keys = await redisWrapper.keys(
			`root_field_${rootFieldId}_*_${entryType}`
		);
		const value = await redisWrapper.get(keys[0], 1000);

		expect(+value).toEqual(expectedValue);
	}
);
