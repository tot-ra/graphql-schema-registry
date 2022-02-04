const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = () => [
	{
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
			new OptimizeCssAssetsPlugin(),
		],

		mode: 'production',
		entry: {
			['management-ui-standalone']: ['./client/entry-standalone.jsx'],
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
	},
];
