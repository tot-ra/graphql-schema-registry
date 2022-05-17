import {ITypeDefData, TypeDefStrategy} from "./strategy";
import {ObjectTypeExtensionNode} from "graphql/language/ast";
import {DocumentNodeType, EntityType} from "../../model/enums";
import {TypeTransactionalRepository} from "../../database/schemaBreakdown/type";
import {createField, createTypes, persistEntities} from "./utils";
import {Type} from "../../model/type";
import {FieldTransactionRepository} from "../../database/schemaBreakdown/field";
import {FieldPayload} from "../../model/field";
import {Argument} from "../../model/argument";
import {ArgumentTransactionRepository} from "../../database/schemaBreakdown/argument";

export class ObjectStrategy implements TypeDefStrategy<ObjectTypeExtensionNode> {
	private type = DocumentNodeType.OBJECT;
	private INVALID_OBJECTS = ['Query', 'Mutation', 'Subscription']

	private typeRepository = TypeTransactionalRepository.getInstance();
	private fieldRepository = FieldTransactionRepository.getInstance();
	private argumentRepository = ArgumentTransactionRepository.getInstance();

	getEntities(data: ITypeDefData): ObjectTypeExtensionNode[] {
		return data.mappedTypes.get(this.type)
			.filter(obj => !this.INVALID_OBJECTS.includes(obj.name.value))
	}

	async insertEntities(data: ITypeDefData, entities: ObjectTypeExtensionNode[]): Promise<void> {
		if (entities.length === 0) {
			return;
		}
		const types = createTypes(entities, EntityType.OBJECT);
		await this.typeRepository.insertIgnoreTypes(data.trx, types);
		const dbTypes: Type[] = await this.typeRepository.getTypesByNames(data.trx, entities.map(e => e.name.value));
		persistEntities(data.dbMap, data.subgraphTypes, dbTypes);
		const fields = this.getObjectFields(data, entities);
		await this.fieldRepository.insertIgnoreFields(data.trx, fields);
		const args = await this.getArgumentFields(data, entities, fields);
		await this.argumentRepository.insertIgnoreArguments(data.trx, args);
	}

	private getObjectFields(data: ITypeDefData, entities: ObjectTypeExtensionNode[]): FieldPayload[] {
		return entities.map(o => {
			const baseFields = o.fields.map(f => createField(f, o.name.value, data));
			const argumentFields = o.fields.map(f => {
				if (f.arguments?.length > 0) {
					return f.arguments.map(a => createField(a, o.name.value, data))
				}
			}).flat(1).filter(Boolean);
			return [...baseFields, ...argumentFields]
		}).flat(1).filter(Boolean);
	}

	private async getArgumentFields(data: ITypeDefData, entities: ObjectTypeExtensionNode[], dbFields: FieldPayload[]): Promise<Argument[]> {
		const fields = await this.fieldRepository.getFieldsByNames(data.trx, dbFields.map(f => f.name));
		fields.forEach(f => data.dbMap.set(f.name, f.id));

		return entities.map(o => {
			const baseFields = o.fields.filter(f => f.arguments?.length > 0);
			return baseFields.map(f => {
				return f.arguments.map(a => {
					return {
						field_id: data.dbMap.get(f.name.value),
						argument_id: data.dbMap.get(a.name.value)
					} as Argument
				}).flat(1);
			}).flat(1)
		}).flat(1)
	}

}
