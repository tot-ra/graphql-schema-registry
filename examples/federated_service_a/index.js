const request = require('request-promise-native');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { ApolloServer, gql } = require('apollo-server');
const {
	ApolloServerPluginLandingPageGraphQLPlayground,
} = require('apollo-server-core');

const typeDefs = gql`
	type Query {
		hello: String
	}
`;

typeDefs.toString = function () {
	return this.loc.source.body;
};

const resolvers = {
	Query: {
		hello: () => 'Hello',
	},
};

const server = new ApolloServer({
	schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
	plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
	cache: 'bounded',
});

server.listen({ port: 6101 }, () => {
	console.log(`🚀 Server ready at http://localhost:6101`);
});

// register schema
(async () => {
	try {
		console.log('Registering schema', typeDefs.toString());

		await request({
			timeout: 5000,
			baseUrl: 'http://localhost:6001', // graphql-schema-registry service URL
			url: '/schema/push',
			method: 'POST',
			json: true,
			body: {
				name: 'service_a', // service name
				version: 'v1', //service version, like docker container hash. Use 'latest' for dev env
				type_defs: typeDefs.toString(),
				url: 'http://localhost:6101',
			},
		});
		console.info('Schema registered successfully!');
	} catch (err) {
		console.error(`Schema registration failed: ${err.message}`);
	}
})();
