// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Application } from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from '@gatsbyjs/webpack-hot-middleware';

// With this trick we get rid of webpack.config.js got compiled
const WEBPACK_FILE_LOCATION = '../webpack.config';

export default async function setupDev(app: Application) {
	const { default: webpackConfig } = await import(WEBPACK_FILE_LOCATION);
	const compiler = webpack(webpackConfig as webpack.Configuration);
	app.use(
		webpackDevMiddleware(compiler, {
			writeToDisk: true,
			publicPath: webpackConfig.output.publicPath,
		})
	);

	app.use(
		//  `webpack-hot-middleware` currently does not work reliably with Webpack 5:
		//  Ref: https://github.com/webpack-contrib/webpack-hot-middleware/pull/397
		webpackHotMiddleware(compiler, {
			log: false,
			path: `/__webpack_hmr`,
			heartbeat: 10 * 1000,
		})
	);
}
