const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');

const isEnvProduction = process.env.NODE_ENV === 'production';

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
	mode: isEnvProduction ? 'production' : 'development',
	entry: {
		'management-ui-standalone': ['./client/entry-standalone.jsx'],
	},
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
