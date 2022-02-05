module.exports = {
	rootDir: '../..',
	resetModules: true,
	resetMocks: true,
	collectCoverage: false,
	testMatch: ['<rootDir>/test/functional/**/*.test.ts'],
	modulePaths: ['<rootDir>'],
	maxWorkers: 1,
	globalSetup: '<rootDir>/test/functional/globalSetup.ts',
	preset: 'ts-jest',
	testEnvironment: 'node',
	moduleFileExtensions: ['ts', 'js', 'json'],
	modulePathIgnorePatterns: ['<rootDir>/app/'],
};
