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
		supergraphSDL: String!
		schema(id: Int!): SchemaDefinition!
		schemas(since: DateTime): [SchemaDefinition]
		schemaPropertyHitsByClient(
			entity: String!
			property: String!
			granularity: UsageGranularity = DAY
		): [SchemaHitByClient]
		schemaFieldsUsage: [SchemaField]
		schemaChangeLog(
			limit: Int = 200
			offset: Int = 0
			serviceName: String
		): [SchemaChangeLogEntry!]!
		schemaEntityHits(
			granularity: UsageGranularity = HOUR
			hours: Int = 24
		): [SchemaEntityHit]
		schemaClientHits(
			granularity: UsageGranularity = HOUR
			hours: Int = 24
		): [SchemaClientHit]
		schemaOperationHits(
			granularity: UsageGranularity = HOUR
			hours: Int = 24
		): [SchemaOperationHit]
		schemaTopOperations(hours: Int = 24, limit: Int = 20): [SchemaOperationSummary]

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

	enum UsageGranularity {
		DAY
		HOUR
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
		bucket: String!
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
		UUID: String
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
		hits1h: Int
		hits24h: Int
	}

	type SchemaChangeLogEntry {
		serviceName: String!
		schemaId: Int!
		schemaUUID: String
		addedTime: DateTime!
		changeType: String!
		change: String!
	}

	type SchemaEntityHit {
		entity: String!
		bucket: String!
		hits: Int!
	}

	type SchemaClientHit {
		clientName: String
		clientVersion: String
		bucket: String!
		hits: Int!
	}

	type SchemaOperationHit {
		operationName: String!
		operationType: String!
		bucket: String!
		hits: Int!
	}

	type SchemaOperationSummary {
		operationName: String!
		operationType: String!
		hits: Int!
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
		healthStatus: ServiceHealthStatus!

		schemas(limit: Int, offset: Int, filter: String): [SchemaDefinition!]!
	}

	enum ServiceHealthStatus {
		UP
		DOWN
	}

	type PersistedQuery {
		key: String
		query: String
		addedTime: String
	}
`;
