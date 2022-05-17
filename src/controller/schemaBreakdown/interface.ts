import {ITypeDefData, TypeDefStrategy} from "./strategy";
import {InterfaceTypeExtensionNode} from "graphql";
import {DocumentNodeType, EntityType} from "../../model/enums";
import {TypeTransactionalRepository} from "../../database/schemaBreakdown/type";
import {createField, createTypes, persistEntities} from "./utils";
import {Type} from "../../model/type";
import {FieldPayload} from "../../model/field";
import {FieldTransactionRepository} from "../../database/schemaBreakdown/field";

export class InterfaceStrategy implements TypeDefStrategy<InterfaceTypeExtensionNode> {
	private type = DocumentNodeType.INTERFACE;

	private typeRepository = TypeTransactionalRepository.getInstance();
	private fieldRepository = FieldTransactionRepository.getInstance();

	getEntities(data: ITypeDefData): InterfaceTypeExtensionNode[] {
		return data.mappedTypes.get(this.type) ?? [];
	}

	async insertEntities(data: ITypeDefData, entities: InterfaceTypeExtensionNode[]): Promise<void> {
		if (entities.length === 0) {
			return;
		}
		const types = createTypes(entities, EntityType.INTERFACE);
		await this.typeRepository.insertIgnoreTypes(data.trx, types);
		const dbTypes: Type[] = await this.typeRepository.getTypesByNames(data.trx, entities.map(e => e.name.value));
		persistEntities(data.dbMap, data.subgraphTypes, dbTypes);
		const fields = this.getInterfaceFields(data, entities);
		await this.fieldRepository.insertIgnoreFields(data.trx, fields);
	}

	private getInterfaceFields(data: ITypeDefData, entities: InterfaceTypeExtensionNode[]): FieldPayload[] {
		return entities.map(e => {
			const parentName = e.name.value;
			return e.fields.map(f => createField(f, parentName, data));
		}).flat(1)
	}
}
