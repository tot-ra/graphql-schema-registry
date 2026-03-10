import { gql } from '@apollo/client';

export const SERVICE_COUNT = gql`
	query serviceCount {
		serviceCount
	}
`;

export const SUPERGRAPH_SDL = gql`
	query getSupergraphSDL {
		supergraphSDL
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
	query getServices {
		services {
			id
			name
			healthStatus
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
	query getSchemaUsageSDL(
		$entity: String!
		$property: String!
		$granularity: UsageGranularity
	) {
		schemaPropertyHitsByClient(
			entity: $entity
			property: $property
			granularity: $granularity
		) {
			hits
			day
			bucket
			clientName
		}
	}
`;

export const SCHEMA_FIELDS_USAGE = gql`
	query getSchemaFieldsUsage {
		schemaFieldsUsage {
			entity
			property
			hitsSum
			hits1h
			hits24h
		}
	}
`;

export const SCHEMA_ENTITY_HITS = gql`
	query getSchemaEntityHits($granularity: UsageGranularity, $hours: Int) {
		schemaEntityHits(granularity: $granularity, hours: $hours) {
			entity
			bucket
			hits
		}
	}
`;

export const SCHEMA_OPERATION_HITS = gql`
	query getSchemaOperationHits($granularity: UsageGranularity, $hours: Int) {
		schemaOperationHits(granularity: $granularity, hours: $hours) {
			operationName
			operationType
			bucket
			hits
		}
	}
`;

export const SCHEMA_TOP_OPERATIONS = gql`
	query getSchemaTopOperations($hours: Int, $limit: Int) {
		schemaTopOperations(hours: $hours, limit: $limit) {
			operationName
			operationType
			hits
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

export const SCHEMA_CHANGE_LOG = gql`
	query getSchemaChangeLog($limit: Int, $offset: Int, $serviceName: String) {
		schemaChangeLog(limit: $limit, offset: $offset, serviceName: $serviceName) {
			serviceName
			schemaId
			schemaUUID
			addedTime
			changeType
			change
		}
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
