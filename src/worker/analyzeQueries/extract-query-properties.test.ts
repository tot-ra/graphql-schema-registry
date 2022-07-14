import extractQueryFields from './extract-query-properties';
import { buildSchema } from 'graphql';
import { TypeInfo } from 'graphql/utilities';

it('should extract field', async () => {
	const schema = buildSchema(`
		scalar ID

		schema {
			query: Query
		}

		type Query {
			user: User
		}

		type User {
			id: ID!
			name: String
		}
	`);

	const result = await extractQueryFields(
		`query {
			user{
				id
				name
			}
		}`,
		new TypeInfo(schema)
	);

	expect(result).toStrictEqual([
		{
			entity: 'Query',
			property: 'user',
		},
		{
			entity: 'User',
			property: 'id',
		},
		{
			entity: 'User',
			property: 'name',
		},
	]);
});
