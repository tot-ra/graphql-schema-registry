const feature = [
	'test/integration/*.feature',
	'--require-module ts-node/register',
	'--require test/integration/**/*.ts',
].join(' ');

module.exports = {
	default: feature,
};
