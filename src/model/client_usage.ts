export interface ClientQueryDAO {
	query: string;
	operations: number[];
	fields: number[];
}

export interface ClientUsageDAO {
	success: number;
	error: number;
}
