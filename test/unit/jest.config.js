module.exports = {
	rootDir: '../..',
	resetModules: true,
	resetMocks: true,
	coverageReporters: ['json', 'lcov', 'clover'],
	collectCoverage: true,
	collectCoverageFrom: ['<rootDir>/app/**/*.js'],
	testMatch: [
		'<rootDir>/test/unit/**/*.test.js',
		'<rootDir>/app/**/*.test.js',
	],
	modulePaths: ['<rootDir>'],
};
