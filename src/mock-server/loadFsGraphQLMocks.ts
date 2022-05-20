import { ApolloServerExpressConfig } from 'apollo-server-express';
import { commonResolvers } from '../graphql/resolvers';
import { listFsMocks } from './listFsMocks';

type LoadFsGraphQlMocks = Pick<
	Required<ApolloServerExpressConfig>,
	'resolvers'
>;

export async function loadFsGraphQlMocks(): Promise<LoadFsGraphQlMocks> {
	const mocks = await listFsMocks('graphQLMock', 'json|ts');
	const roots = {};

	// Resolvers
	await Promise.all(
		mocks.map(async (filePath: string) => {
			const mock = (await import(filePath)).default;
			const [schemaKey] = Object.keys(mock);

			if (/ts$/.test(filePath)) {
				roots[schemaKey] = mock[schemaKey];
			} else if (/json$/.test(filePath)) {
				roots[schemaKey] = () => mock[schemaKey];
			}
		})
	);

	return {
		resolvers: {
			...commonResolvers,
			Query: roots,
		},
	};
}
