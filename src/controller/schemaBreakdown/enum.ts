import { ITypeDefData, TypeDefStrategy } from './strategy';
import { EnumTypeExtensionNode } from 'graphql';
import { DocumentNodeType, EntityType } from '../../model/enums';
import { TypeTransactionalRepository } from '../../database/schemaBreakdown/type';
import { FieldTransactionRepository } from '../../database/schemaBreakdown/field';
import { createTypes, persistEntities } from './utils';
import { Type } from '../../model/type';
import { FieldPayload } from '../../model/field';

export class EnumStrategy implements TypeDefStrategy<EnumTypeExtensionNode> {
	private type = DocumentNodeType.ENUM;

	private typeRepository = TypeTransactionalRepository.getInstance();
	private fieldRepository = FieldTransactionRepository.getInstance();

	getEntities(data: ITypeDefData): EnumTypeExtensionNode[] {
		return data.mappedTypes.get(this.type) ?? [];
	}

	async insertEntities(
		data: ITypeDefData,
		entities: EnumTypeExtensionNode[]
	): Promise<void> {
		if (entities.length === 0) {
			return;
		}
		const types = createTypes(entities, EntityType.ENUM);
		await this.typeRepository.insertIgnoreTypes(data.trx, types);
		const dbTypes: Type[] = await this.typeRepository.getTypesByNames(
			data.trx,
			entities.map((e) => e.name.value)
		);
		persistEntities(data.dbMap, data.subgraphTypes, dbTypes);
		const fields = this.getEnumValues(data, entities);
		await this.fieldRepository.insertIgnoreFields(data.trx, fields);
	}

	private getEnumValues(
		data: ITypeDefData,
		entities: EnumTypeExtensionNode[]
	): FieldPayload[] {
		const stringTypeId = data.dbMap.get('String');
		return entities
			.map((e) => {
				if (e.values.length === 0) {
					return null;
				}
				const parentId = data.dbMap.get(e.name.value);
				return e.values.map((v) => {
					return {
						name: v.name.value,
						description: v.description?.value,
						is_nullable: true,
						is_array: false,
						is_array_nullable: false,
						is_deprecated: false,
						parent_type_id: parentId,
						children_type_id: stringTypeId,
					} as FieldPayload;
				});
			})
			.flat(1)
			.filter(Boolean);
	}
}
