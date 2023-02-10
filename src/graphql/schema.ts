import { gql } from 'apollo-server-express';

export default gql`
	directive @inherits(type: String!) on OBJECT

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
		listTypes: ListedTypes!
		listTypeInstances(
			type: String!
			limit: Int!
			offset: Int!
		): ListedTypeInstances!
		getTypeInstance(type: String!, id: Int!): TypeInstanceDetailResponse!
		getFieldsUsageStats(
			parentTypeId: Int!
			startDate: Date!
			endDate: Date!
		): [FieldsUsageStats!]!
		getRootFieldUsageStats(
			rootFieldId: Int!
			startDate: Date!
			endDate: Date!
		): [RootFieldUsageStats!]!
		routerConfig(
			ref: String
			apiKey: String
			ifAfterId: ID
		): RouterConfigResponse!
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
		total: Int!
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

	type Nullable {
		isNullable: Boolean!
		isArray: Boolean!
		isArrayNullable: Boolean!
	}

	type Parent {
		id: Int!
		name: String!
		type: String!
	}

	type Argument {
		name: String!
		description: String
		isNullable: Boolean!
		isArray: Boolean!
		isArrayNullable: Boolean!
		parent: Parent!
	}

	type FieldDetails {
		key: String!
		isDeprecated: Boolean!
		arguments: [Argument!]
	}

	type InputDetails {
		key: String!
		isDeprecated: Boolean!
	}

	type OutputDetails {
		isDeprecated: Boolean!
	}

	type ProvidedByDetails {
		key: String!
		providedBy: [Service!]!
	}

	type Field {
		id: Int!
		description: String
		parent: Parent!
		isNullable: Boolean!
		isArray: Boolean!
		isArrayNullable: Boolean!
		key: String!
		isDeprecated: Boolean!
		arguments: [Argument!]
	}

	type InputParam {
		description: String
		parent: Parent!
		isNullable: Boolean!
		isArray: Boolean!
		isArrayNullable: Boolean!
		key: String!
	}

	type OutputParam {
		description: String
		parent: Parent!
		isNullable: Boolean!
		isArray: Boolean!
		isArrayNullable: Boolean!
	}

	type ParamProvidedBy {
		description: String
		parent: Parent!
		key: String!
		providedBy: Service!
	}

	type TypeInstanceDetail {
		id: Int!
		name: String!
		description: String
		type: String!
		fields: [Field!]
		usedBy: [ParamProvidedBy!]
		implementations: [ParamProvidedBy!]
	}

	type OperationInstanceDetail {
		id: Int!
		name: String!
		description: String
		type: String!
		inputParams: [InputParam!]
		outputParams: [OutputParam!]
	}

	type UsageStats {
		error: Int!
		success: Int!
	}

	type UsageStatsByOperationName {
		operationName: String!
		usageStats: UsageStats!
	}

	type FieldsClientUsageStats {
		clientVersion: String!
		usageStats: UsageStats!
	}

	type FieldsClient {
		clientName: String!
		clientVersions: [FieldsClientUsageStats!]!
	}

	type FieldsUsageStats {
		fieldId: Int!
		clients: [FieldsClient!]!
	}

	type RootFieldClientUsageStats {
		clientVersion: String!
		usageStatsByOperationName: [UsageStatsByOperationName!]!
	}

	type RootFieldUsageStats {
		clientName: String!
		clientVersions: [RootFieldClientUsageStats!]!
	}

	union TypeInstanceDetailResponse =
		  TypeInstanceDetail
		| OperationInstanceDetail

	union RouterConfigResponse = RouterConfigResult | Unchanged | FetchError

	type RouterConfigResult {
		id: ID!
		minDelaySeconds: Int!
		supergraphSDL: String!
	}

	type Unchanged {
		id: ID!
		minDelaySeconds: Int!
	}

	type FetchError {
		code: FetchErrorCode!
		message: String!
		minDelaySeconds: Int!
	}

	enum FetchErrorCode {
		AUTHENTICATION_FAILED
		ACCESS_DENIED
		UNKNOWN_REF
		RETRY_LATER
	}
`;
