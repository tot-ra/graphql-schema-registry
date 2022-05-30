import { ApolloServerExpressConfig } from 'apollo-server-express';

import typeDefs from './schema';
import resolvers from './resolvers';
import dataloader from './dataloader';

export const getServerProps = (): ApolloServerExpressConfig => ({
	typeDefs,
	resolvers,
	context: () => ({
		dataloaders: dataloader(),
	}),
});
