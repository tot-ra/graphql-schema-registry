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
	maxWorkers: 1,
	verbose: true,
	resetModules: true,
	resetMocks: true,
	collectCoverage: false,
	modulePaths: ['<rootDir>'],
};
