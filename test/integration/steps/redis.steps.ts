import { Then } from '@cucumber/cucumber';
import expect from 'expect';

Then(
	'the redis must contain {int} entries for client {int}',
	async (totalKeys: number, clientId: number) => {
		const redisWrapper = await import('../../../src/redis');

		const total = await redisWrapper.default.keys(`*_${clientId}_*`);

		expect(total.length).toEqual(totalKeys);
	}
);

Then(
	'{int} error registered for client {int}',
	async (totalErrors: number, clientId: number) => {
		const redisWrapper = await import('../../../src/redis');

		const keys = await redisWrapper.default.keys(`e_${clientId}_*`);
		const value = await redisWrapper.default.get(keys[0]);

		expect(+value).toEqual(totalErrors);
	}
);

Then(
	'{int} success registered for client {int}',
	async (totalErrors: number, clientId: number) => {
		const redisWrapper = await import('../../../src/redis');

		const keys = await redisWrapper.default.keys(`s_${clientId}_*`);
		const value = await redisWrapper.default.get(keys[0]);

		expect(+value).toEqual(totalErrors);
	}
);
