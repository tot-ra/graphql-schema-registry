import request from 'request-promise';

describe('Service startup', () => {
	it('health endpoint returns 200 after warmup', async () => {
		const result = await request({
			method: 'GET',
			uri: 'http://localhost:6001/health',
			resolveWithFullResponse: true,
			json: true,
		});

		expect(result.statusCode).toBe(200);
		expect(result.body).toBe('ok');
	});
});
