import { gql } from 'apollo-server-express';

export default gql`
	directive @inherits(type: String!) on OBJECT

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
		listTypeInstances(
			type: String!
			limit: Int!
			offset: Int!
		): ListedTypeInstances!
		getTypeInstance(type: String!, id: Int!): TypeInstanceDetailResponse!
		getOperationUsageTrack(
			id: Int!
			startDate: Date!
			endDate: Date!
		): [ClientOperationUsageTrack!]!
		getEntityUsageTrack(
			id: Int!
			startDate: Date!
			endDate: Date!
		): [EntityUsageTrack!]!
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

	type Executions {
		success: Int!
		error: Int!
		total: Int!
	}

	type OperationExecutions {
		name: String!
		executions: Executions!
	}

	type VersionOperations {
		id: String!
		operations: [OperationExecutions!]!
	}

	type ClientVersion {
		name: String!
		versions: [VersionOperations!]!
	}

	type ClientOperationUsageTrack {
		client: ClientVersion!
	}

	type EntityUsageTrack {
		id: Int!
		executions: Executions!
	}

	union TypeInstanceDetailResponse =
		  TypeInstanceDetail
		| OperationInstanceDetail
`;
