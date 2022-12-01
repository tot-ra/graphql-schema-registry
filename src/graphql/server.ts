import { ApolloServerExpressConfig } from 'apollo-server-express';
import { PluginDefinition } from 'apollo-server-core';
import { connection } from '../database';

import typeDefs from './schema';
import resolvers from './resolvers';
import dataloader from './dataloader';
import { logger } from '../logger';

const errorPlugin: PluginDefinition = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	requestDidStart(): Promise<any> {
		return {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			async didEncounterErrors({ errors }): Promise<void> {
				if (errors.length > 0) {
					errors.forEach((error) => {
						logger.error(error);
					});
				}
			},
		};
	},
};

export const getServerProps = (): ApolloServerExpressConfig => ({
	typeDefs,
	resolvers,
	context: () => ({
		dataloaders: dataloader(connection),
	}),
	plugins: [errorPlugin],
	cache: 'bounded',
});
