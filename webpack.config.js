const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const config = (env) => ({
	output: {
		path: path.resolve('./dist/assets'),
		filename: '[name].js',
		libraryTarget: 'umd',
		chunkFilename: '[name].[contenthash].js',
		crossOriginLoading: 'anonymous',
		pathinfo: true,
	},

	module: {
		rules: [
			{
				test: /.jsx?$/,
				use: {
					loader: 'babel-loader',
				},
				include: [path.resolve(__dirname, './client')],
			},
			{
				test: /\.(png|jpg|svg)$/,
				loader: 'file-loader',
				options: {
					name: '[name].[ext]',
				},
			},
			{
				test: /\.(p|post)?css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
			},
		],
	},

	resolve: {
		extensions: ['.js', '.jsx', '.json'],
	},

	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].css?v=[contenthash]',
		}),
	],
});

function createConfigDev(name, entry) {
	return {
		mode: 'development',
		name,
		entry: {
			[name]: [
				`webpack-hot-middleware/client?path=/__webpack_hmr&reload=true&name=${name}`,
				entry,
			],
		},
		stats: 'minimal',
		devtool: 'eval-cheap-source-map',
		plugins: [new webpack.HotModuleReplacementPlugin()],
	};
}

function createConfigProd(name, entry) {
	return {
		mode: 'production',
		entry: {
			[name]: [entry],
		},
		optimization: {
			namedModules: true,
			namedChunks: true,
			minimizer: [
				new TerserPlugin({
					parallel: true,
					sourceMap: false,
				}),
			],
		},
		plugins: [new OptimizeCssAssetsPlugin()],
	};
}

const standalone = {
	dev: createConfigDev(
		'management-ui-standalone',
		'./client/entry-standalone.jsx'
	),
	prod: createConfigProd(
		'management-ui-standalone',
		'./client/entry-standalone.jsx'
	),
};

module.exports = (env) => [
	merge(
		config(env),
		env && env.production ? standalone.prod : standalone.dev
	),
];
