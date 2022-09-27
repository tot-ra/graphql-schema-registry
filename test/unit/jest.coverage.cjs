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
	collectCoverageFrom: [
		'<rootDir>/src/**/*.ts',
		'!<rootDir>/src/*/*.test.ts',
		'!<rootDir>/src/*/*.itest.ts',

		'!<rootDir>/src/setupDev.ts',
		'!<rootDir>/src/config.ts',
		'!<rootDir>/src/index.ts',
		'!<rootDir>/src/schema-registry.ts',
	],
	coveragePathIgnorePatterns: [
		'/node_modules/',
		'/migrations/',
		'/examples/',
		'/dist/',
		'/coverage/',
		'/client/',
	],
	resetModules: true,
	resetMocks: true,
	modulePaths: ['<rootDir>'],
};
