import { Type, TypePayload } from '../../model/type';
import { ScalarTypeExtensionNode } from 'graphql/language/ast';
import {
	DocumentNodeType,
	EntityType,
	FieldProperty,
	OperationType,
} from '../../model/enums';
import { FieldPayload } from '../../model/field';
import { ITypeDefData } from './strategy';
import { Operation } from '../../model/operation';
import { OperationParam } from '../../model/operation_param';
import { Subgraph } from '../../model/subgraph';

export const persistEntities = (
	map: Map<string, number>,
	subgraph: number[],
	entities: Type[] | Operation[]
) => {
	entities.forEach((t) => {
		map.set(t.name, t.id);
		subgraph.push(t.id);
	});
};

export const createTypes = (data: any[], type: EntityType): TypePayload[] => {
	return data.map((d) => {
		return {
			name: d.name.value,
			description: d.description?.value,
			type,
		} as TypePayload;
	});
};

export const createOperations = (
	data: any[],
	type: OperationType,
	service_id: number
): Operation[] => {
	return data.map((d) => {
		return {
			name: d.name.value,
			description: d.description?.value,
			type,
			service_id,
		} as Operation;
	});
};

export const createField = (
	field: any,
	parentName: string,
	data: ITypeDefData
): FieldPayload => {
	const name = field.name.value;
	let is_array = false;
	let is_nullable = true;
	let is_array_nullable = true;
	const is_deprecated =
		field.directives?.filter(
			(d) => d.name.value.toLowerCase() === 'deprecated'
		).length > 0;
	const description = field.description?.value ?? field.description;
	while (field.type) {
		const nextType = field.type;
		const fieldType = field.kind;
		if (
			(fieldType === DocumentNodeType.FIELD ||
				fieldType === DocumentNodeType.INPUT_VALUE) &&
			nextType?.kind === FieldProperty.NOT_NULL
		) {
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
		children_type_id: data.dbMap.get(field.name.value),
	};
};

export const createOperationParam = (
	field: any,
	parentName: string,
	is_output: boolean,
	data: ITypeDefData
): OperationParam => {
	let name = '';
	if (!is_output) {
		name = field.name.value;
	}
	let is_array = false;
	let is_nullable = true;
	let is_array_nullable = true;
	const description = field.description?.value ?? field.description;
	while (field.type) {
		const nextType = field.type;
		const fieldType = field.kind;
		if (
			(fieldType === DocumentNodeType.FIELD ||
				fieldType === DocumentNodeType.INPUT_VALUE) &&
			nextType?.kind === FieldProperty.NOT_NULL
		) {
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
	if (is_output) {
		name = field.name.value;
	}

	return {
		name,
		description,
		is_array,
		is_array_nullable,
		is_nullable,
		is_output,
		operation_id: data.dbMap.get(parentName),
		type_id: data.dbMap.get(field.name.value),
	} as OperationParam;
};

export const createSubgraphs = (
	subgraphIds: number[],
	service_id: number
): Subgraph[] => {
	return subgraphIds.map((t) => {
		return {
			service_id,
			type_id: t,
		} as Subgraph;
	});
};
