import { gql } from '@apollo/client';
import { Order } from '../schema/types';

export const SERVICE_COUNT = gql`
	query serviceCount {
		serviceCount
	}
`;
export const PERSISTED_QUERIES_COUNT = gql`
	query persistedQueriesCount {
		persistedQueriesCount
	}
`;
export const PERSISTED_QUERIES = gql`
	query persistedQueries {
		persistedQueries {
			key
			query
			addedTime
		}
	}
`;

export const SERVICES_LIST = gql`
	query getServices(
		$limit: Int
		$offset: Int
		$order: Order
		$sortField: SortField
	) {
		services(
			limit: $limit
			offset: $offset
			sortField: $sortField
			order: $order
		) {
			id
			name
		}
	}
`;

export const SERVICE_SCHEMAS = gql`
	query getServiceVersions($id: Int!) {
		service(id: $id) {
			id

			schemas(limit: 100) {
				id
				UUID
				isActive
				addedTime
				typeDefs
				isDev

				characters
				previousSchema {
					characters
				}
			}
		}
	}
`;

export const SCHEMA_DETAILS = gql`
	query getSchema($schemaId: Int!) {
		schema(id: $schemaId) {
			id
			UUID
			typeDefs
			isActive
			addedTime

			service {
				url
			}

			containerCount

			containers {
				version
				addedTime
				commitLink
			}

			previousSchema {
				typeDefs
			}
		}
	}
`;

export const SCHEMA_SDL = gql`
	query getSchemaSDL($schemaId: Int!) {
		schema(id: $schemaId) {
			fieldsUsage {
				entity
				property
				clientVersionId
				hitsSum
			}
		}
	}
`;
export const SCHEMA_USAGE_SDL = gql`
	query getSchemaUsageSDL($entity: String!, $property: String!) {
		schemaPropertyHitsByClient(entity: $entity, property: $property) {
			hits
			day
			clientName
		}
	}
`;

export const CLIENTS_LIST = gql`
	query getClients {
		clients {
			name
			versions {
				id
				version
				updatedTime
			}
		}
	}
`;

export const CLIENT_VERSION_PERSISTED_QUERIES = gql`
	query gerClientPersistedQueries($clientVersionId: Int!) {
		persistedQueries(clientVersionId: $clientVersionId) {
			key
			query
		}
	}
`;

export const LOGS = gql`
	query getLogs {
		logs
	}
`;

export const SEARCH = gql`
	query getSearch($query: String!) {
		search(filter: $query) {
			__typename

			... on Service {
				id
				name
			}
			... on SchemaDefinition {
				id
				typeDefs
				service {
					id
					name
				}
			}
		}
	}
`;

export type ListCount = {
	type: string;
	count: number;
};

export type ListTypesOutput = {
	listTypes: {
		operations: ListCount[];
		entities: ListCount[];
	};
};

export const LIST_TYPES = gql`
	query GetListTypes {
		listTypes {
			operations {
				type
				count
			}
			entities {
				type
				count
			}
		}
	}
`;

type BaseTypeInstancesVars = {
	type: string;
	limit: number;
};

export type TypeInstancesVars = BaseTypeInstancesVars & {
	offset: number;
	order?: Order;
};

export type Pagination = {
	page: number;
	totalPages: number;
	limit: number;
	total: number;
};

type ListType<T> = {
	items: T[];
};

type ListTypeItem = {
	id: number;
	name: string;
};

type ListTypeInstance = ListTypeItem & {
	description?: string;
	type: string;
	providedBy: {
		name: string;
	}[];
};

export type ListTypeInstances = ListType<ListTypeInstance> & {
	pagination: Pagination;
};

export type TypeInstancesOutput = {
	listTypeInstances: ListTypeInstances;
};

export const TYPE_INSTANCES = gql`
	query GetListTypeInstances(
		$type: String!
		$limit: Int!
		$offset: Int!
		$order: Order
	) {
		listTypeInstances(
			type: $type
			limit: $limit
			offset: $offset
			order: $order
		) {
			items {
				id
				name
				description
				type
				providedBy {
					name
				}
			}
			pagination {
				page
				totalPages
				total
				limit
			}
		}
	}
`;

export type TypeSideInstancesVars = BaseTypeInstancesVars;

export type TypeSideInstancesOutput = {
	listTypeInstances: ListType<ListTypeItem>;
};

export const TYPE_SIDE_INSTANCES = gql`
	query GetListTypeSideInstances($type: String!, $limit: Int!) {
		listTypeInstances(type: $type, limit: $limit, offset: 0) {
			items {
				id
				name
				type
			}
		}
	}
`;

export type TypeInstanceVars = {
	type: string;
	instanceId: number;
};

type Param = {
	description?: string;
	isNullable: boolean;
	isArray: boolean;
	isArrayNullable: boolean;
	parent: {
		id: number;
		name: string;
		type: string;
	};
};

type ParamProvidedBy = Omit<
	Param,
	'isNullable' | 'isArray' | 'isArrayNullable'
> & {
	key: string;
	providedBy?: {
		name: string;
	};
};

type Field = Param & {
	id: number;
	key: string;
	isDeprecated: boolean;
	arguments?: [
		{
			name: string;
			description?: string;
			isNullable: boolean;
			isArray: boolean;
			isArrayNullable: boolean;
			parent: {
				id: number;
				name: string;
				type: string;
			};
		}
	];
};

type InputParam = Param & {
	key: string;
};

type OutputParam = Param;

type GetTypeInstanceBase = {
	id: number;
	name: string;
	description?: string;
	isDeprecated?: boolean;
	type: string;
};

export type TypeInstanceOutput = {
	getTypeInstance: GetTypeInstanceBase & {
		fields?: Field[];
		inputParams?: InputParam[];
		outputParams?: OutputParam[];
		usedBy?: ParamProvidedBy[];
		implementations?: ParamProvidedBy[];
	};
};

export const TYPE_INSTANCE = gql`
	query GetTypeInstance($type: String!, $instanceId: Int!) {
		getTypeInstance(type: $type, id: $instanceId) {
			__typename
			... on TypeInstanceDetail {
				id
				name
				description
				type
				fields {
					description
					isNullable
					isArray
					isArrayNullable
					key
					isDeprecated
					parent {
						id
						name
						type
					}
					arguments {
						name
						description
						isNullable
						isArray
						isArrayNullable
						parent {
							id
							name
							type
						}
					}
				}
				usedBy {
					description
					key
					parent {
						id
						name
						type
					}
					providedBy {
						name
					}
				}
				implementations {
					description
					parent {
						id
						name
						type
					}
					key
					providedBy {
						name
					}
				}
			}
			... on OperationInstanceDetail {
				id
				name
				description
				type
				inputParams {
					description
					parent {
						id
						name
						type
					}
					isNullable
					isArray
					isArrayNullable
					key
				}
				outputParams {
					description
					parent {
						id
						name
						type
					}
					isNullable
					isArray
					isArrayNullable
				}
			}
		}
	}
`;

export type UsageStats = {
	error: number;
	success: number;
};

export type TypeInstanceRootFieldStatsOutput = {
	getRootFieldUsageStats: {
		clientName: string;
		clientVersions: {
			clientVersion: string;
			usageStatsByOperationName: {
				operationName: string;
				usageStats: UsageStats;
			}[];
		}[];
	}[];
	getTypeInstance: GetTypeInstanceBase;
};

export type TypeInstanceRootFieldStatsVars = {
	endDate: string;
	rootFieldId: number;
	startDate: string;
	type: string;
};

export const TYPE_INSTANCE_ROOT_FIELD_STATS = gql`
	query GetTypeInstanceRootFieldStats(
		$rootFieldId: Int!
		$type: String!
		$startDate: Date!
		$endDate: Date!
	) {
		getRootFieldUsageStats(
			rootFieldId: $rootFieldId
			startDate: $startDate
			endDate: $endDate
		) {
			clientName
			clientVersions {
				clientVersion
				usageStatsByOperationName {
					operationName
					usageStats {
						success
						error
					}
				}
			}
		}

		getTypeInstance(type: $type, id: $rootFieldId) {
			__typename
			... on TypeInstanceDetail {
				id
				name
				description
				type
			}
			... on OperationInstanceDetail {
				id
				name
				description
				type
			}
		}
	}
`;

export type TypeInstanceObjectStatsVars = {
	endDate: string;
	objectId: number;
	startDate: string;
};

export type FieldClient = {
	clientName: string;
	clientVersions: {
		clientVersion: string;
		usageStats: UsageStats;
	}[];
};

export type TypeInstanceObjectStatsOutput = TypeInstanceOutput & {
	getFieldsUsageStats: {
		fieldId: number;
		clients: FieldClient[];
	}[];
};

export const TYPE_INSTANCE_OBJECT_STATS = gql`
	query GetTypeInstanceObjectStats(
		$objectId: Int!
		$startDate: Date!
		$endDate: Date!
	) {
		getFieldsUsageStats(
			parentTypeId: $objectId
			startDate: $startDate
			endDate: $endDate
		) {
			fieldId
			clients {
				clientName
				clientVersions {
					clientVersion
					usageStats {
						error
						success
					}
				}
			}
		}

		getTypeInstance(type: "object", id: $objectId) {
			__typename
			... on TypeInstanceDetail {
				id
				name
				description
				type
				fields {
					id
					description
					isNullable
					isArray
					isArrayNullable
					key
					isDeprecated
					parent {
						id
						name
						type
					}
				}
			}
		}
	}
`;
