import express from 'express';

export function assetRouter(router) {
	router.use('/assets', express.static('dist/assets'));
	// Also serve at root for backwards compatibility
	router.use(express.static('dist/assets'));
}

export function indexHtml() {
	const assetsRootUrl = process.env.ASSETS_URL || '';
	const assetsVersion = 'latest';
	const isProduction = process.env.NODE_ENV === 'production';

	return async function (req, res) {
		const styleTag = isProduction
			? `<link rel="stylesheet" type="text/css" href="${assetsRootUrl}/assets/style.css?v=${assetsVersion}">`
			: '';
		const scriptTag = isProduction
			? `<script src="${assetsRootUrl}/assets/management-ui-standalone.js?v=${assetsVersion}" crossorigin></script>`
			: `<script type="module" src="/client/entry-standalone.tsx"></script>`;

		let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <meta name="referrer" content="no-referrer" />
    <title>Schema Registry</title>
    <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,400i,600,600i,700,700i" rel="stylesheet">
    ${styleTag}
  </head>
  <body style="margin:0;padding:0;">
    <div id="root"></div>
    ${scriptTag}
  </body>
  </html>`;

		if (!isProduction && req.app?.locals?.vite) {
			html = await req.app.locals.vite.transformIndexHtml(
				req.originalUrl,
				html
			);
		}

		res.send(html);
	};
}
