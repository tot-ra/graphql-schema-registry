module.exports = {
	rootDir: '../..',
	resetModules: true,
	resetMocks: true,
	collectCoverage: false,
	testMatch: [
		'<rootDir>/test/unit/**/*.test.js',
		'<rootDir>/app/**/*.test.js',
	],
	modulePaths: ['<rootDir>'],
};
