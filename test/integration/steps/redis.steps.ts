import { Then, DataTable, Given, Before } from '@cucumber/cucumber';
import expect from 'expect';
import { readFileSync } from 'fs';
import { resolve } from 'path';
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
		promises.push(redisWrapper.set(key, keys[key]));
	}
	await Promise.all(promises);
});

Given(
	'the redis has the key {string} with value as in file {string}',
	async (key, file) => {
		const redisWrapper = await getConnection();
		const fileContent = readFileSync(resolve(redisDataPath, file), 'utf8');

		await redisWrapper.set(key, fileContent);
	}
);

Then(
	'the redis must contain {int} entries for client {int}',
	async (totalKeys: number, clientId: number) => {
		const redisWrapper = await getConnection();

		const total = await redisWrapper.keys(`*_${clientId}_*`);

		expect(total.length).toEqual(totalKeys);
	}
);

Then(
	'{int} error registered for client {int}',
	async (totalErrors: number, clientId: number) => {
		const redisWrapper = await getConnection();

		const keys = await redisWrapper.keys(`e_${clientId}_*`);
		const value = await redisWrapper.get(keys[0]);

		expect(+value).toEqual(totalErrors);
	}
);

Then(
	'{int} success registered for client {int}',
	async (totalErrors: number, clientId: number) => {
		const redisWrapper = await getConnection();

		const keys = await redisWrapper.keys(`s_${clientId}_*`);
		const value = await redisWrapper.get(keys[0]);

		expect(+value).toEqual(totalErrors);
	}
);
