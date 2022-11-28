import { ApolloServerExpressConfig } from 'apollo-server-express';

import { connection } from '../database';

import typeDefs from './schema';
import resolvers from './resolvers';
import dataloader from './dataloader';

export const getServerProps = (): ApolloServerExpressConfig => ({
	typeDefs,
	resolvers,
	context: () => ({
		dataloaders: dataloader(connection),
	}),
	cache: 'bounded',
});
