export type FieldPayload = {
	name: string;
	description: string;
	is_nullable: boolean;
	is_array: boolean;
	is_array_nullable: boolean;
	is_deprecated: boolean;
	children_type_id: number;
	parent_type_id: number;
};

export type Field = FieldPayload & {
	id: number;
};
