module.exports = {
	rootDir: '../..',
	resetModules: true,
	restoreMocks: true,
	clearMocks: true,
	resetMocks: true,
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
	modulePaths: ['<rootDir>'],

	coverageDirectory: 'coverage/integration',
	coverageReporters: ['text', 'json', 'lcov', 'clover'],
	collectCoverage: true,
	collectCoverageFrom: [
		'<rootDir>/src/**/*.ts',
		'!<rootDir>/src/**/*.test.ts',
	],
	coveragePathIgnorePatterns: [
		'/node_modules/',
		'/migrations/',
		'/examples/',
		'/dist/',
		'/coverage/',
		'/client/',
	],
};
