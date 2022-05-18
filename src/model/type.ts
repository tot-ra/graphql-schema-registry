import { EntityType } from './enums';

export type TypePayload = {
	name: string;
	description?: string;
	type: EntityType;
};

export type Type = TypePayload & {
	id: number;
};
