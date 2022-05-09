import {OperationType} from "./enums";

export type OperationPayload = {
	name?: string;
	description?: string;
	type?: OperationType;
	serviceId?: number;
}

export type Operation = OperationPayload & {
	id: number;
}
