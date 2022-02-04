const request = require('request-promise');
const { resetDb } = require('../db');

beforeEach(async () => {
	await resetDb();
});

describe('GET /schema/latest', function () {
	it('returns 200 with empty body', async () => {
		const result = await request({
			method: 'GET',
			uri: 'http://localhost:6001/schema/latest',
			resolveWithFullResponse: true,
			json: true,
		});

		expect(result.statusCode).toBe(200);
		expect(result.body).toEqual({
			data: [],
			success: true,
		});
	});
});
