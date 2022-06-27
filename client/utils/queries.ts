import { gql } from '@apollo/client';

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
	query getServices {
		services {
			id
			name
		}
	}
`;

export const SERVICE_SCHEMAS = gql`
	query getServiceVersions($id: Int!, $filter: String) {
		service(id: $id) {
			id

			schemas(limit: 100, filter: $filter) {
				id
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
	query GetListTypeInstances($type: String!, $limit: Int!, $offset: Int!) {
		listTypeInstances(type: $type, limit: $limit, offset: $offset) {
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

export type TypeInstanceOperationStatsOutput = {
	getOperationUsageTrack: {
		client: {
			name: string;
			versions: {
				id: string;
				operations: {
					name: string;
					executions: {
						success: number;
						error: number;
						total: number;
					};
				}[];
			}[];
		};
	}[];

	getTypeInstance: GetTypeInstanceBase;
};

type TypeInstanceBaseStatsVars = {
	id: number;
	startDate: Date;
	endDate: Date;
};

export type TypeInstanceOperationStatsVars = TypeInstanceBaseStatsVars & {
	type: string;
};

export const TYPE_INSTANCE_OPERATION_STATS = gql`
	query GetTypeInstanceOperationStats(
		$id: Int!
		$type: String!
		$startDate: Date!
		$endDate: Date!
	) {
		getOperationUsageTrack(
			id: $id
			startDate: $startDate
			endDate: $endDate
		) {
			client {
				name
				versions {
					id
					operations {
						name
						executions {
							success
							error
							total
						}
					}
				}
			}
		}

		getTypeInstance(type: $type, id: $id) {
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

export type TypeInstanceObjectStatsVars = TypeInstanceBaseStatsVars;

export type TypeInstanceObjectStatsOutput = TypeInstanceOutput & {
	getEntityUsageTrack: {
		id: number;
		executions: {
			success: number;
			error: number;
			total: number;
		};
	}[];
};

export const TYPE_INSTANCE_OBJECT_STATS = gql`
	query GetTypeInstanceObjectStats(
		$id: Int!
		$startDate: Date!
		$endDate: Date!
	) {
		getEntityUsageTrack(id: $id, startDate: $startDate, endDate: $endDate) {
			id
			executions {
				success
				error
				total
			}
		}

		getTypeInstance(type: "object", id: $id) {
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

export type TypeInstanceObjectFieldStatsVars = TypeInstanceBaseStatsVars;

export type TypeInstanceObjectFieldStatsOutput = {
	getFieldUsageTrack: {
		client: {
			name: string;
			versions: {
				id: string;
				execution: {
					success: number;
					error: number;
					total: number;
				};
			}[];
		};
	}[];
};

export const TYPE_INSTANCE_OBJECT_FIELD_STATS = gql`
	query GetTypeInstanceObjectFieldStats(
		$id: Int!
		$startDate: Date!
		$endDate: Date!
	) {
		getFieldUsageTrack(id: $id, startDate: $startDate, endDate: $endDate) {
			client {
				name
				versions {
					id
					execution {
						success
						error
						total
					}
				}
			}
		}
	}
`;
