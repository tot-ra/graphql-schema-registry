exports.router = (router) => {
	router.use(require('express').static('dist'));
};

exports.indexHtml = () => {
	const assetsRootUrl = process.env.ASSETS_URL || 'http://localhost:6001';
	const assetsVersion = 'latest';

	return function indexHtml(req, res) {
		res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <meta name="referrer" content="no-referrer" />
    <title>Schema Registry</title>
    <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,400i,600,600i,700,700i" rel="stylesheet">
    ${`<link rel="stylesheet" type="text/css" href="${assetsRootUrl}/assets/management-ui-standalone.css?v=${assetsVersion}">`}
  </script>
  </head>
  <body style="margin:0;padding:0;">
    <div id="root"></div>
    <script src="${assetsRootUrl}/assets/management-ui-standalone.js?v=${assetsVersion}" crossorigin></script>
  </body>
  </html>`);
	};
};
