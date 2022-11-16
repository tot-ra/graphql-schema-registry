import { Then, DataTable, Given, Before } from '@cucumber/cucumber';
import expect from 'expect';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { redisDataPath } from '../config/config';
import { getTimestamp } from '../../../src/redis/utils';

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
		// @ts-ignore
		promises.push(redisWrapper.set(key, keys[key], 1000));
	}
	await Promise.all(promises);
});

Given('the redis has usage for file {string}', async (file) => {
	const redisWrapper = await getConnection();
	const fileContent = readFileSync(resolve(redisDataPath, file), 'utf8');
	const content = JSON.parse(fileContent);

	const now = getTimestamp();
	const now2 = new Date(now * 1000);
	const subDays = new Date().setDate(now2.getDate() - content.days);
	const date = getTimestamp(subDays);
	const redisDate = Math.floor(new Date(date).getTime());
	await redisWrapper.set('o_999_diff', JSON.stringify(content.object), 1000);
	await redisWrapper.set(`e_999_diff_${redisDate}`, content.errors, 1000);
	await redisWrapper.set(`s_999_diff_${redisDate}`, content.success, 1000);
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
	'the redis must contain {int} entries for client {int}',
	async (totalKeys: number, clientId: number) => {
		const redisWrapper = await getConnection();

		const total = await redisWrapper.keys(`*_${clientId}_*`, 1000);

		expect(total.length).toEqual(totalKeys);
	}
);

Then(
	'{int} error registered for client {int}',
	async (totalErrors: number, clientId: number) => {
		const redisWrapper = await getConnection();

		const keys = await redisWrapper.keys(`e_${clientId}_*`);
		const value = await redisWrapper.get(keys[0], 1000);

		expect(+value).toEqual(totalErrors);
	}
);

Then(
	'{int} success registered for client {int}',
	async (totalErrors: number, clientId: number) => {
		const redisWrapper = await getConnection();

		const keys = await redisWrapper.keys(`s_${clientId}_*`);
		const value = await redisWrapper.get(keys[0], 1000);

		expect(+value).toEqual(totalErrors);
	}
);
