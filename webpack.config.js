const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const webpack = require('webpack');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const isEnvDevelopment = process.env.NODE_ENV !== 'production';
const isEnvProduction = process.env.NODE_ENV === 'production';

const shouldUseSourceMap = isEnvDevelopment;

module.exports = {
	output: {
		clean: true,
		path: path.resolve('./dist/assets'),
		filename: '[name].js',
		libraryTarget: 'umd',
		chunkFilename: '[name].[contenthash].js',
		crossOriginLoading: 'anonymous',
		pathinfo: true,
	},
	module: {
		rules: [
			// Handle node_modules packages that contain sourcemaps
			shouldUseSourceMap && {
				enforce: 'pre',
				exclude: /@babel(?:\/|\\{1,2})runtime/,
				test: /\.(js|mjs|jsx|ts|tsx|css)$/,
				loader: require.resolve('source-map-loader'),
			},
			{
				oneOf: [
					{
						test: /\.jsx?$/,
						loader: 'babel-loader',
						exclude: /node_modules/,
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
		].filter(Boolean),
	},
	resolve: {
		extensions: ['.js', '.jsx', '.json'],
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].css?v=[contenthash]',
		}),
		isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
		isEnvDevelopment &&
			new ReactRefreshPlugin({
				overlay: {
					sockIntegration: 'whm',
				},
			}),
	].filter(Boolean),
	mode: isEnvProduction ? 'production' : 'development',
	entry: {
		'management-ui-standalone': [
			isEnvDevelopment && '@gatsbyjs/webpack-hot-middleware/client',
			'./client/entry-standalone.jsx',
		].filter(Boolean),
	},
	devtool: shouldUseSourceMap ? 'cheap-module-source-map' : false,
	ignoreWarnings: [/Failed to parse source map/],
	optimization: {
		minimize: isEnvProduction,
		minimizer: [
			'...',
			new CssMinimizerWebpackPlugin({
				minimizerOptions: {
					preset: [
						'default',
						{
							discardComments: { removeAll: true },
						},
					],
				},
			}),
		],
	},
};
