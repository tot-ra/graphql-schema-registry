module.exports = {
	rootDir: '../..',
	resetModules: true,
	restoreMocks: true,
	clearMocks: true,
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: [
		'<rootDir>/test/integration/**/*.test.ts',
		'<rootDir>/src/**/*.itest.ts',
	],
	moduleFileExtensions: ['ts', 'js', 'json'],
	modulePathIgnorePatterns: ['<rootDir>/app/'],
	maxWorkers: 1,
	verbose: true,
	resetMocks: true,
	collectCoverage: false,
	modulePaths: ['<rootDir>'],
};
