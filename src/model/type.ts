import {EntityType} from "./enums";

export type TypePayload = {
	name: String,
	description?: String,
	type: EntityType
}

export type Type = TypePayload & {
	id: number
}
