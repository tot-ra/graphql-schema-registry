import {Type, TypePayload} from "../../model/type";
import {ScalarTypeExtensionNode} from "graphql/language/ast";
import {EntityType} from "../../model/enums";

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
