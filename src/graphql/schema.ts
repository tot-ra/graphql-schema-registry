import { gql } from 'apollo-server-express';

export default gql`
	scalar Time
	scalar Date
	scalar DateTime

	type Query {
		services(limit: Int, offset: Int): [Service]
		service(id: Int!): Service
		schema(id: Int!): SchemaDefinition!

		persistedQueries(
			searchFragment: String
			limit: Int
			offset: Int
		): [PersistedQuery]
		persistedQuery(key: String!): PersistedQuery
		persistedQueriesCount: Int!

		listTypes: ListedTypes!
		listTypeInstances(type: String!, limit: Int!, offset: Int!): ListedTypeInstances!
	}

	type Mutation {
		deactivateSchema(id: Int!): SchemaDefinition!
		activateSchema(id: Int!): SchemaDefinition!
	}

	type SchemaDefinition {
		id: Int!
		service: Service!
		isActive: Boolean!
		typeDefs: String
		addedTime: DateTime
		characters: Int

		isDev: Boolean!
		containerCount: Int!

		previousSchema: SchemaDefinition
		containers: [Container]
	}

	type Container {
		id: Int!
		version: String!
		addedTime: DateTime
		commitLink: String
	}

	type Service {
		id: Int!
		name: String!
		url: String
		updatedTime: Date
		addedTime: Date
		isActive: Boolean

		schemas(limit: Int, offset: Int, filter: String): [SchemaDefinition!]
	}

	type PersistedQuery {
		key: String
		query: String
		addedTime: String
	}

	enum Type {
		SCALAR
		ENUM
		OBJECT
		INTERFACE
		UNION
		INPUT
		DIRECTIVE
	}

	enum Operation {
		QUERY
		MUTATION
		SUBSCRIPTION
	}

	type TypeTotal {
		type: Type!
		count: Int!
	}

	type OperationTotal {
		type: Operation!
		count: Int!
	}

	type ListedTypes {
		operations: [OperationTotal!]!
		entities: [TypeTotal!]!
	}

	type Pagination {
		page: Int!
    	totalPages: Int!
    	limit: Int!
	}

	type TypeInstance {
		id: Int!
        name: String!
        description: String
        type: String!
        providedBy: [Service!]!
	}

	type ListedTypeInstances {
		items: [TypeInstance!]!
		pagination: Pagination!
	}
`;
