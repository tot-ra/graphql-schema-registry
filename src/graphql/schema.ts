import { gql } from 'apollo-server-express';

export default gql`
	scalar Time
	scalar Date
	scalar DateTime
	scalar JSON

	type Query {
		services(limit: Int, offset: Int): [Service]
		service(id: Int!): Service
		serviceCount: Int!
		schema(id: Int!): SchemaDefinition!
		schemas(since: DateTime): [SchemaDefinition]
		schemaPropertyHitsByClient(
			entity: String!
			property: String!
		): [SchemaHitByClient]

		persistedQueries(
			searchFragment: String
			limit: Int
			offset: Int
			clientVersionId: Int
		): [PersistedQuery]
		persistedQuery(key: String!): PersistedQuery
		persistedQueriesCount: Int!
		clients: [Client]
		clientVersions(since: DateTime): [ClientVersion]
		logs: JSON
		search(filter: String!): [SearchResult]
	}

	union SearchResult = Service | SchemaDefinition

	type Mutation {
		deactivateSchema(id: Int!): SchemaDefinition!
		activateSchema(id: Int!): SchemaDefinition!
	}

	type SchemaHitByClient {
		entity: String!
		property: String!
		region: String
		hits: Int!

		day: Date!
		clientName: String
	}
	type SchemaHitByClientVersion {
		entity: String!
		property: String!
		hits: Int!
		day: Date!
		version: ClientVersion
		updatedTime: DateTime!
	}
	type Client {
		name: String!
		versions: [ClientVersion]
	}

	type ClientVersion {
		id: Int!
		version: String!
		addedTime: DateTime!
		updatedTime: DateTime!

		client: Client
	}

	type SchemaDefinition {
		id: Int!
		service: Service!
		isActive: Boolean!

		characters: Int
		typeDefs: String
		fieldsUsage: [SchemaField]
		addedTime: DateTime

		isDev: Boolean!
		containerCount: Int!

		previousSchema: SchemaDefinition
		containers: [Container]
	}

	type SchemaField {
		entity: String!
		property: String!
		clientVersionId: Int
		hitsSum: Int
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

		schemas(limit: Int, offset: Int, filter: String): [SchemaDefinition!]!
	}

	type PersistedQuery {
		key: String
		query: String
		addedTime: String
	}
`;
