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
	key: string;
	isDeprecated: boolean;
	arguments?: [
		{
			name: string;
			description?: string;
			parent: {
				id: number;
				type: string;
				isNullable: boolean;
				isArray: boolean;
				isArrayNullable: boolean;
			};
		}
	];
};

type InputParam = Param & {
	key: string;
};

type OutputParam = Param;

export type TypeInstanceOutput = {
	getTypeInstance: {
		name: string;
		description: string;
		type: string;
		fields: Field[];
		inputParams: InputParam[];
		outputParams: OutputParam[];
		usedBy: ParamProvidedBy[];
		implementations: ParamProvidedBy[];
	};
};

export const TYPE_INSTANCE = gql`
	query GetTypeInstance($type: String!, $instanceId: Int!) {
		getTypeInstance(type: $type, id: $instanceId) {
			name
			description
			type
			fields {
				key
				description
				isDeprecated
				isNullable
				isArray
				isArrayNullable
				parent {
					id
					name
					type
				}
				arguments {
					name
					description
					parent {
						id
						type
						isNullable
						isArray
						isArrayNullable
					}
				}
			}
			inputParams {
				key
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
			outputParams {
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
			usedBy {
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
		}
	}
`;
