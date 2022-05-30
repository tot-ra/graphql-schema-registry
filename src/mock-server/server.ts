import { ApolloServer } from 'apollo-server-express';

import { loadFsGraphQlMocks } from './loadFsGraphQLMocks';
import typeDefs from '../graphql/schema';

const initServer = async (app) => {
	const { resolvers } = await loadFsGraphQlMocks();

	const server = new ApolloServer({
		resolvers,
		typeDefs,
	});

	server.applyMiddleware({ app });
};

export default initServer;
