const sinon = require('sinon');

const mockLogger = {
	error: jest.fn()
};

const mockDiscoverService = jest.fn();

const mockRedlockLock = jest.fn();
const mockRedlockUnLock = jest.fn().mockImplementation(() => Promise.resolve());
const mockRedlock = jest.fn().mockImplementation(() => {
	return {
		LockError: jest.requireActual('redlock').LockError,
		lock: mockRedlockLock
	};
});

jest.mock('ioredis', () => jest.fn());
jest.mock('redlock', () => mockRedlock);
jest.mock('../logger', () => mockLogger);
jest.mock('../discoverService', () => mockDiscoverService);

const actualRedLock = jest.requireActual('redlock');

const { lock } = require('./index');

describe('app/redis/index.js', () => {
	afterEach(() => {
		jest.clearAllMocks();
		sinon.reset();
	});
	describe('lock()', () => {
		it('return lock function value if lock function is successful', async () => {
			const func = jest.fn().mockReturnValue(true);

			const result = await lock('key', () => {
				return func();
			});

			expect(mockRedlockLock).toHaveBeenCalledWith('locks.key', 60 * 1000);
			expect(func).toHaveBeenCalled();
			expect(result).toEqual(true);
		});

		it('throw error and unlock if lock function failed', async () => {
			const error = new Error('Failed');
			const func = jest.fn().mockImplementation(() => {
				throw error;
			});

			mockRedlockLock.mockImplementation(() => ({ unlock: mockRedlockUnLock }));

			await expect(
				lock('key', () => {
					return func();
				})
			).rejects.toEqual(error);

			expect(mockRedlockLock).toHaveBeenCalledWith('locks.key', 60 * 1000);
			expect(func).toHaveBeenCalled();
			expect(mockRedlockUnLock).toHaveBeenCalled();
			expect(mockLogger.error).toHaveBeenCalled();
		});

		it('return if already locked', async () => {
			const func = jest.fn();

			mockRedlockLock.mockRejectedValue(new actualRedLock.LockError('Failed'));

			const result = await lock('key', () => {
				return func();
			});

			expect(mockRedlockLock).toHaveBeenCalledWith('locks.key', 60 * 1000);
			expect(func).toHaveBeenCalledTimes(0);
			// eslint-disable-next-line no-undefined
			expect(result).toEqual(undefined);
		});

		it('throw error if redis locking failed', async () => {
			const func = jest.fn();
			const error = new Error('Failed');

			mockRedlockLock.mockRejectedValue(error);

			await expect(
				lock('key', () => {
					return func();
				})
			).rejects.toEqual(error);

			expect(mockRedlockLock).toHaveBeenCalledWith('locks.key', 60 * 1000);
			expect(func).toHaveBeenCalledTimes(0);
		});
	});
});
