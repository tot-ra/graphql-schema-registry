import { ApolloServer } from 'apollo-server-express';

import typeDefs from './schema';
import resolvers from './resolvers';
import dataloader from './dataloader';

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: (req) => ({
		dataloaders: dataloader(),
	}),
});

export default (app) => {
	server.applyMiddleware({ app });
};
