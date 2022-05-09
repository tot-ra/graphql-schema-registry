export type FieldPayload = {
	name: String;
	is_nullable: Boolean;
	is_array: Boolean;
	is_array_nullable: Boolean;
	is_deprecated: Boolean;
}

export type Field = FieldPayload & {
	id: number;
	children_id: number;
	parent_id: number;
}
