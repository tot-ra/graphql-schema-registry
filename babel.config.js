module.exports = (api) => {
	// This caches the Babel config
	api.cache.using(() => process.env.NODE_ENV);
	return {
		presets: [
			[
				'@babel/preset-env',
				{
					modules: 'auto',
					useBuiltIns: 'usage',
					corejs: '3',
				},
			],
			[
				'@babel/preset-react',
				{ development: !api.env('production'), runtime: 'automatic' },
			],
		],
		plugins: [
			'babel-plugin-styled-components',
			'@babel/plugin-transform-runtime',
			[
				'prismjs',
				{
					languages: ['graphql'],
					theme: 'okaidia',
					css: true,
				},
			],
			!api.env('production') && 'react-refresh/babel',
		].filter(Boolean),
	};
};
