import {Type, TypePayload} from "../../model/type";
import {ScalarTypeExtensionNode} from "graphql/language/ast";
import {DocumentNodeType, EntityType, FieldProperty} from "../../model/enums";
import {FieldPayload} from "../../model/field";
import {ITypeDefData} from "./strategy";

export const persistEntities = (map: Map<string, number>, subgraph: number[], entities: Type[]) => {
	entities.forEach(t => {
		map.set(t.name, t.id);
		subgraph.push(t.id);
	})
}

export const createTypes = (data: any[], type: EntityType): TypePayload[] => {
	return data.map(d => {
		return {
			name: d.name.value,
			description: d.description?.value,
			type
		} as TypePayload
	})
}

export const createField = (field: any, parentName: string, data: ITypeDefData): FieldPayload => {
	let name = field.name.value;
	let is_array = false;
	let is_nullable = true
	let is_array_nullable = true;
	const is_deprecated = field.directives?.filter(d => d.name.value.toLowerCase() === "deprecated").length > 0;
	const description = field.description?.value ?? field.description;
	while (field.type) {
		const nextType = field.type;
		const fieldType = field.kind;
		if ((fieldType === DocumentNodeType.FIELD || fieldType === DocumentNodeType.INPUT_VALUE)
			&& nextType?.kind === FieldProperty.NOT_NULL) {
			is_nullable = false;
		}
		if (fieldType === FieldProperty.IS_ARRAY) {
			is_array = true;
			if (nextType?.kind === FieldProperty.NOT_NULL) {
				is_array_nullable = false;
			}
		}
		field = nextType;
	}

	return {
		name,
		description,
		is_array,
		is_array_nullable,
		is_nullable,
		is_deprecated,
		parent_type_id: data.dbMap.get(parentName),
		children_type_id: data.dbMap.get(field.name.value)
	}
}
