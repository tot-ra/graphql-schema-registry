import {ITypeDefData, TypeDefStrategy} from "./strategy";
import {DirectiveDefinitionNode} from "graphql/language/ast";
import {DocumentNodeType, EntityType} from "../../model/enums";
import {TypeTransactionalRepository} from "../../database/schemaBreakdown/type";
import {createField, createTypes, persistEntities} from "./utils";
import {Type} from "../../model/type";
import {FieldTransactionRepository} from "../../database/schemaBreakdown/field";
import {FieldPayload} from "../../model/field";

export class DirectiveStrategy implements TypeDefStrategy<DirectiveDefinitionNode> {
	private type = DocumentNodeType.DIRECTIVE;

	private typeRepository = TypeTransactionalRepository.getInstance();
	private fieldRepository = FieldTransactionRepository.getInstance();

	getEntities(data: ITypeDefData): DirectiveDefinitionNode[] {
		return data.mappedTypes.get(this.type) ?? [];
	}

	async insertEntities(data: ITypeDefData, entities: DirectiveDefinitionNode[]): Promise<void> {
		if (entities.length === 0) {
			return;
		}
		const types = createTypes(entities, EntityType.DIRECTIVE);
		await this.typeRepository.insertIgnoreTypes(data.trx, types);
		const dbTypes: Type[] = await this.typeRepository.getTypesByNames(data.trx, entities.map(e => e.name.value));
		persistEntities(data.dbMap, data.subgraphTypes, dbTypes);
		const args = this.getDirectiveArguments(data, entities);
		await this.fieldRepository.insertIgnoreFields(data.trx, args);
	}

	private getDirectiveArguments(data: ITypeDefData, entities: DirectiveDefinitionNode[]): FieldPayload[] {
		return entities.map(e => {
			const parentName = e.name.value;
			return e.arguments.map(a => createField(a, parentName, data));
		}).flat(1)
	}
}
