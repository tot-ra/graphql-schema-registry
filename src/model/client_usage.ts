import { UsageStats } from './usage_counter';

interface ClientOperationEntity {
	objectId: number;
	fields: number[];
}

interface ClientOperation {
	id: number;
	entities: ClientOperationEntity[];
}

interface ClientQuery {
	name: string;
	sdl: string;
}

export interface ClientOperationDAO {
	query: ClientQuery;
	operations: ClientOperation[];
}

export type ExecutionsDAO = Executions & {
	hash: string;
	clientId: number;
};

export type ClientOperationsDTO = Map<string, ClientOperationDAO>;

export interface Executions {
	success: number;
	error: number;
	total: number;
}

export interface FieldClientVersion {
	id: string;
	execution: Executions;
}

export interface ClientUsage<T> {
	name: string;
	versions: T[];
}

export type FieldUsageResponse = {
	client: ClientUsage<FieldClientVersion>;
}[];

export interface FieldUsage {
	id: number;
	executions: Executions;
}

export type EntityUsageResponse = FieldUsage[];

export interface ClientVersionUsageStats {
	usageStatsByOperationName: {
		operationName: string;
		usageStats: UsageStats;
	}[];
	version: string;
}

export type RootFieldUsageStats = ClientUsage<ClientVersionUsageStats>[];
