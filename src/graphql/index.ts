import { ApolloServer } from 'apollo-server-express';
import { getServerProps } from './server';

const initServer = async (app) => {
	const props = getServerProps();

	const server = new ApolloServer(props);

	server.applyMiddleware({ app });
};

export default initServer;
