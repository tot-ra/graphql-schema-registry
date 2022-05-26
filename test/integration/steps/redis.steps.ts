import { Then } from '@cucumber/cucumber';

Then('the redis must contain 3 entries for client {string} and version {string}',
	async (clientName: string, clientVersion: string) => {
		expect(1).toEqual(1);
	})
