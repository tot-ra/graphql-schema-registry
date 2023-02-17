export interface Log {
	timestamp: number;
	message:
		| {
				message: string;
				extensions?: {
					code: number;
				};
		  }[]
		| string;
	level: string;
}
