const { assert } = require('chai');
const { gql } = require('apollo-server-express');
const { composeAndValidateSchema } = require('./federation');

describe('app/helpers/federation.js', () => {

	it('schema validation supports directives', () => {
		const typeDefs = gql`
			directive @test on FIELD_DEFINITION

			type Query {
				user(id: ID!): User!
			}

			type User {
				id: ID!
				username: String! @test
			}
		`;

		typeDefs.toString = () => {
			return typeDefs.loc.source.body.toString();
		}

		const schema = {
			name: 'test schema',
			type_defs: typeDefs.toString()
		}

		try {
			const validatedSchema = composeAndValidateSchema([schema]);

			assert.isNotNull(validatedSchema);
		}
		catch (error) {
			assert.fail(error.details);
		}
	});
});
