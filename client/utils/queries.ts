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

export type TypeInstancesVars = {
	type: string;
	limit?: number;
	offset?: number;
};

export type ListTypeInstances = {
	items: [
		{
			id: number;
			name: string;
			description?: string;
			type: string;
			providedBy: [
				{
					name: string;
				}
			];
		}
	];
	pagination: {
		page: number;
		totalPages: number;
		limit: number;
	};
};
export type TypeInstancesOutput = {
	listTypeInstances: ListTypeInstances;
};

export const TYPE_INSTANCES = gql`
	query GetListTypeInstances($type: String!, $limit: Int, $offset: Int) {
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
				limit
			}
		}
	}
`;
