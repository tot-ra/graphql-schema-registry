const mockLogger = {
	info: jest.fn(),
	warn: jest.fn(),
	error: jest.fn(),
	debug: jest.fn(),
};

jest.mock('../logger', () => ({ logger: mockLogger }));

describe('redis', () => {
	describe('get', () => {
		it('should return null if no data', async () => {
			const { initRedis, get, disconnect } = (await import('./index'))
				.default;

			await initRedis();

			const result = await get('aaa');

			expect(result).toEqual(null);
			expect(mockLogger.warn).not.toHaveBeenCalled();
			expect(mockLogger.error).not.toHaveBeenCalled();
			disconnect();
		});

		it('get should return null if redis is not initialized', async () => {
			// no prior initRedis() here
			const { initRedis, get, disconnect } = (await import('./index'))
				.default;
			const result = await get('aaa');

			expect(result).toEqual(null);
			expect(mockLogger.warn).toHaveBeenCalled();
			expect(mockLogger.error).not.toHaveBeenCalled();
		});

		it('get should return null + log error if redis is disconnected', async () => {
			// no prior initRedis() here
			const { initRedis, get, disconnect } = (await import('./index'))
				.default;

			await initRedis();
			disconnect();
			const result = await get('aaa');

			expect(result).toEqual(null);
			expect(mockLogger.error).toHaveBeenCalled();
			expect(mockLogger.warn).not.toHaveBeenCalled();
		});
	});

	describe('set', () => {
		it('set + get', async () => {
			const { initRedis, get, set, disconnect } = (
				await import('./index')
			).default;

			await initRedis();

			await set('bbb', 123, 5);
			const result = await get('bbb');

			expect(result).toEqual('123');
			expect(mockLogger.warn).not.toHaveBeenCalled();
			expect(mockLogger.error).not.toHaveBeenCalled();

			disconnect();
		});

		it('set with TTL expiration + wait = get should return null', async () => {
			const { initRedis, get, set, disconnect } = (
				await import('./index')
			).default;

			await initRedis();

			await set('bbb', 123, 1);

			// wait for 1 sec
			await new Promise((resolve) => setTimeout(resolve, 1010));

			const result = await get('bbb');

			expect(result).toEqual(null);
			expect(mockLogger.warn).not.toHaveBeenCalled();
			expect(mockLogger.error).not.toHaveBeenCalled();
			disconnect();
		});
	});

	it('delete', async () => {
		const { initRedis, get, set, del, disconnect } = (
			await import('./index')
		).default;

		await initRedis();

		await set('bbb', 123, 5);
		let result = await get('bbb');

		expect(result).toEqual('123');

		await del('bbb');
		result = await get('bbb');

		expect(result).toEqual(null);
		disconnect();
	});
});
