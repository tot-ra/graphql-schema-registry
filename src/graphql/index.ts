import { ApolloServer } from 'apollo-server-express';

import typeDefs from './schema';
import resolvers from './resolvers';

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: (req) => ({
		dataloaders: require('./dataloader')(req),
	}),
});

export default (app) => {
	server.applyMiddleware({ app });
};
