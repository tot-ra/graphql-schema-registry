import { ApolloServer } from 'apollo-server-express';
import { getServerProps } from './server';

import { connection } from '../database';

import typeDefs from './schema';
import resolvers from './resolvers';
import dataloader from './dataloader';

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: () => ({
		dataloaders: dataloader(connection),
	}),
	cache: 'bounded',
});

export default async (app) => {
	await server.start();
	server.applyMiddleware({ app });
};

export const getServer = () => {
	return server;
};
