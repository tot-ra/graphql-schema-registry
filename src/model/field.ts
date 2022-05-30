export type FieldPayload = {
	name: string;
	description: string;
	is_nullable: Boolean;
	is_array: Boolean;
	is_array_nullable: Boolean;
	is_deprecated: Boolean;
	children_type_id: number;
	parent_type_id: number;
};

export type Field = FieldPayload & {
	id: number;
};
