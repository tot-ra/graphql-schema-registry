export interface UsageCounter {
	success: number;
	errors: number;
}

export type QueryResult = {
	errors: number;
	success: number;
};
