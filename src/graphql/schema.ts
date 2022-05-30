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
		listTypes: ListTypesOutput!
		listTypeInstances(
			type: String!
			limit: Int
			offset: Int
		): ListTypeInstancesOutput!
		getTypeInstance(type: String!, id: Int!): TypeInstanceDetailResponse!
		getOperationUsageTrack(
			id: Int!
			startDate: Date!
			endDate: Date!
		): [OperationUsageTrackResponse!]!
		getEntityUsageTrack(
			id: Int!
			startDate: Date!
			endDate: Date!
		): [EntityUsageTrackResponse!]!
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

		schemas(limit: Int, offset: Int, filter: String): [SchemaDefinition!]!
	}

	type PersistedQuery {
		key: String
		query: String
		addedTime: String
	}

	type Pagination {
		page: Int!
		totalPages: Int!
		limit: Int!
		total: Int!
	}

	type TypeCount {
		type: String!
		count: Int!
	}

	type ListTypesOutput {
		operations: [TypeCount!]!
		entities: [TypeCount!]!
	}

	type ListTypeInstancesProviders {
		name: String!
	}

	type TypeInstance {
		id: Int!
		name: String!
		description: String
		type: String!
		providedBy: [ListTypeInstancesProviders!]!
	}

	type ListTypeInstancesOutput {
		items: [TypeInstance!]!
		pagination: Pagination
	}

	type ParamParent {
		id: Int!
		name: String!
		type: String!
	}

	type FieldArgumentParent {
		id: Int!
		name: String!
		type: String!
	}

	type FieldArgument {
		name: String!
		description: String
		isNullable: Boolean
		isArray: Boolean
		isArrayNullable: Boolean
		parent: FieldArgumentParent!
	}

	type Field {
		id: Int!
		key: String
		isDeprecated: Boolean!
		description: String
		isNullable: Boolean!
		isArray: Boolean!
		isArrayNullable: Boolean!
		parent: ParamParent!
		arguments: [FieldArgument!]
	}

	type InputParam {
		key: String
		description: String
		isNullable: Boolean!
		isArray: Boolean!
		isArrayNullable: Boolean!
		parent: ParamParent!
	}

	type OutputParam {
		description: String
		isNullable: Boolean!
		isArray: Boolean!
		isArrayNullable: Boolean!
		parent: ParamParent!
	}

	type ProvidedByParam {
		key: String
		isDeprecated: Boolean!
		description: String
		isNullable: Boolean!
		isArray: Boolean!
		isArrayNullable: Boolean!
		parent: ParamParent!
		providedBy: ListTypeInstancesProviders!
	}

	type TypeInstanceDetail {
		id: ID!
		name: String!
		description: String!
		type: String!
		fields: [Field!]
		usedBy: [ProvidedByParam!]!
		implementations: [ProvidedByParam!]
	}

	type OperationInstanceDetail {
		id: ID!
		name: String!
		description: String!
		isDeprecated: Boolean!
		type: String!
		inputParams: [InputParam!]
		outputParams: [OutputParam!]
	}

	union TypeInstanceDetailResponse =
		  TypeInstanceDetail
		| OperationInstanceDetail

	type UsageExecution {
		success: Int!
		error: Int!
		total: Int!
	}

	type OperationUsageTrackOperation {
		name: String!
		executions: UsageExecution!
	}

	type OperationUsageTrackVersion {
		id: String!
		operations: [OperationUsageTrackOperation!]!
	}

	type OperationUsageTrackClient {
		name: String!
		versions: [OperationUsageTrackVersion!]!
	}

	type OperationUsageTrackResponse {
		client: OperationUsageTrackClient!
	}

	type EntityUsageTrackParent {
		id: Int!
		name: String!
		type: String!
	}

	type EntityUsageTrackResponse {
		id: Int!
		executions: UsageExecution!
	}
`;
