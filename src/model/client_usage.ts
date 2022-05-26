import { Parent } from './repository';

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
};

export type ClientOperationsDTO = Map<string, ClientOperationDAO>;

export interface Executions {
	success: number;
	error: number;
	total: number;
}

export interface OperationExecutions {
	name: string;
	executions: Executions;
}

interface ClientVersion {
	id: string;
	operations: OperationExecutions[];
}

export interface ClientUsage {
	name: string;
	versions: ClientVersion[];
}

export interface OperationUsageResponse {
	client: ClientUsage[];
}

export interface EntityUsageResponse {
	name: string;
	description?: string;
	isNullable: boolean;
	isArray: boolean;
	isArrayNullable: boolean;
	parent: Parent;
	executions: Executions;
}
