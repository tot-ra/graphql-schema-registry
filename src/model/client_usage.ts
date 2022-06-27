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

export interface ExecutionsByName {
	name: string;
	executions: Executions;
}

export interface OperationClientVersion {
	id: string;
	operations: ExecutionsByName[];
}

export interface FieldClientVersion {
	id: string;
	execution: Executions;
}

export interface ClientUsage<T> {
	name: string;
	versions: T[];
}

export type OperationUsageResponse = {
	client: ClientUsage<OperationClientVersion>;
}[];

export type FieldUsageResponse = {
	client: ClientUsage<FieldClientVersion>;
}[];

export interface FieldUsage {
	id: number;
	executions: Executions;
}

export type EntityUsageResponse = FieldUsage[];
