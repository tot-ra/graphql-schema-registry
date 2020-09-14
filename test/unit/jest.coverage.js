module.exports = {
	rootDir: '../..',
	resetModules: true,
	resetMocks: true,
	coverageReporters: ['text', 'json', 'lcov', 'clover'],
	collectCoverage: true,
	collectCoverageFrom: ['<rootDir>/app/**/*.js'],
	coveragePathIgnorePatterns: [
		'/node_modules/',
		'/migrations/',
		'/examples/',
		'/dist/',
		'/coverage/',
		'/client/',
	],
	testMatch: [
		'<rootDir>/test/unit/**/*.test.js',
		'<rootDir>/app/**/*.test.js',
	],
	modulePaths: ['<rootDir>'],
};
