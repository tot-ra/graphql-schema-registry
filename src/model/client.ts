export type ClientPayload = {
	name: string;
	version: string;
};
export type Client = ClientPayload & {
	id: number;
};
