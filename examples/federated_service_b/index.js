const request = require('request-promise-native');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { ApolloServer, gql } = require('apollo-server');
const {
	ApolloServerPluginLandingPageGraphQLPlayground,
} = require('apollo-server-core');

const typeDefs = gql(`
  	type Query {
    	world: String
		hola: String
  	}
`);

typeDefs.toString = function () {
	return this.loc.source.body;
};

const resolvers = {
	Query: {
		world: () => {
			return 'World!';
		},
		hola: () => 'Hola!',
	},
};

const server = new ApolloServer({
	schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
	plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
	cache: 'bounded',
});

server.listen({ port: 6102 }, () => {
	console.log(`🚀 Server ready at http://localhost:6102`);
});

(async () => {
	try {
		await request({
			timeout: 5000,
			baseUrl: 'http://localhost:6001', // graphql-schema-registry service URL
			url: '/schema/push',
			method: 'POST',
			json: true,
			body: {
				name: 'service_b', // service name
				version: 'v2', //service version, like docker container hash. Use 'latest' for dev env
				type_defs: typeDefs.toString(),
				url: 'http://localhost:6102',
			},
		});
		console.info('Schema registered successfully!');
	} catch (err) {
		console.error(`Schema registration failed: ${err.message}`);
	}
})();
