module.exports = {
	rootDir: '../..',
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: [
		'<rootDir>/test/unit/**/*.test.ts',
		'<rootDir>/src/**/*.test.ts',
	],
	moduleFileExtensions: ['ts', 'js', 'json'],
	modulePathIgnorePatterns: ['<rootDir>/app/'],

	coverageDirectory: 'coverage/unit',
	coverageReporters: ['text', 'json', 'lcov', 'clover'],
	collectCoverage: true,
	collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
	coveragePathIgnorePatterns: [
		'/node_modules/',
		'/migrations/',
		'/examples/',
		'/dist/',
		'/coverage/',
		'/client/',
		'.itest.ts',
	],
	resetModules: true,
	resetMocks: true,
	modulePaths: ['<rootDir>'],
};
