import { ApolloServer } from 'apollo-server-express';

import typeDefs from './schema';
import resolvers from './resolvers';
import dataloader from './dataloader';

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: () => ({
		dataloaders: dataloader(),
	}),
	cache: 'bounded',
});

export default async (app) => {
	await server.start();
	server.applyMiddleware({ app });
};
