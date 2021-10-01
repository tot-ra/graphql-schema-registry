const path = require('path');
const express = require('express');
const app = express();
const router = express.Router();
const { json } = require('body-parser');
const {
	runHttpQuery,
	convertNodeHttpToRequest,
} = require('apollo-server-core');

const { introspectionQuery } = require('graphql');
const { ApolloServerBase } = require('apollo-server-core');
const CustomGateway = require('./custom-gateway');
const RemoteGraphQLDataSource = require('./remote-data-source');

app.use(router);
router.use(json());

router.get('/graphql', (req, res) => {
	res.sendFile(path.join(__dirname + '/playground.html'));
});

router.post('/graphql', (req, res, next) => {
	Promise.resolve(handleGraphqlRequest(req, res, next)).catch(next);
});

app.all('*', (req, res) => {
	return res.status(404).send('404 - Not found!');
});

app.listen(6100, () => {
	console.info('Server listening on port: 6100');
});

// graphql part
const gateway = new CustomGateway({
	serviceList: [],
	debug: true,
	buildService: (service) => new RemoteGraphQLDataSource(this, service),
	experimental_pollInterval: 10000, // 10 sec
});

const apolloServerBase = new ApolloServerBase({
	gateway,
	subscriptions: false,
	debug: true,
});

const handleGraphqlRequest = async (req, res) => {
	const { graphqlResponse, responseInit } = await runHttpQuery([req, res], {
		method: req.method,
		query: req.body,
		options: await apolloServerBase.graphQLServerOptions({ req, res }),
		request: convertNodeHttpToRequest(req),
	});

	if (responseInit.headers) {
		for (const [name, value] of Object.entries(responseInit.headers)) {
			res.setHeader(name, value);
		}
	}

	res.write(graphqlResponse);
	res.end();
};
