module.exports = {
	presets: [
		[
			'@babel/preset-env',
			{
				modules: false,
				targets: { node: 'current' },
			},
		],
		'@babel/preset-react',
	],
	plugins: [
		['babel-plugin-styled-components'],
		['@babel/plugin-transform-runtime'],
		[
			'prismjs',
			{
				languages: ['graphql'],
				theme: 'okaidia',
				css: true,
			},
		],
	],
};
