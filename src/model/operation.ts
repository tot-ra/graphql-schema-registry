import {OperationType} from "./enums";

export type OperationPayload = {
	name?: string;
	description?: string;
	type?: OperationType;
	service_id?: number;
}

export type Operation = OperationPayload & {
	id: number;
}
