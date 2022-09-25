const { ApolloGateway } = require('@apollo/gateway');
const { ApolloServer } = require('apollo-server');
const {
	ApolloServerPluginLandingPageGraphQLPlayground,
} = require('apollo-server-core');
const CustomSupergraphManager = require('./supergraph');

const gateway = new ApolloGateway({
	supergraphSdl: new CustomSupergraphManager({ pollIntervalInMs: 30000 }),
});

const server = new ApolloServer({
	gateway,
	plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
	cache: 'bounded',
});

server.listen({ port: 6100 }, () => {
	console.log(`🚀 Server ready at http://localhost:6100`);
});
