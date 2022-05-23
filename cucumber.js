const feature = [
	'test/integration/*.feature',
	'--require-module ts-node/register',
	'--require test/integration/**/*.ts',
	'--publish-quiet',
].join(' ');

module.exports = {
	default: feature,
};
