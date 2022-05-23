import { ITypeDefData, TypeDefStrategy } from './strategy';
import { DocumentNodeType, EntityType } from '../../model/enums';
import { TypeTransactionalRepository } from '../../database/schemaBreakdown/type';
import { FieldTransactionRepository } from '../../database/schemaBreakdown/field';
import { InputObjectTypeExtensionNode } from 'graphql';
import { createField, createTypes, persistEntities } from './utils';
import { Type } from '../../model/type';
import { FieldDefinitionNode } from 'graphql/language/ast';
import { Field } from '../../model/field';

export class InputStrategy
	implements TypeDefStrategy<InputObjectTypeExtensionNode>
{
	private type = DocumentNodeType.INPUT;

	private typeRepository = TypeTransactionalRepository.getInstance();
	private fieldRepository = FieldTransactionRepository.getInstance();

	getEntities(data: ITypeDefData): InputObjectTypeExtensionNode[] {
		return data.mappedTypes.get(this.type) ?? [];
	}

	async insertEntities(
		data: ITypeDefData,
		entities: InputObjectTypeExtensionNode[]
	): Promise<void> {
		if (entities.length === 0) {
			return;
		}
		const types = createTypes(entities, EntityType.INPUT);
		await this.typeRepository.insertIgnoreTypes(data.trx, types);
		const dbTypes: Type[] = await this.typeRepository.getTypesByNames(
			data.trx,
			entities.map((e) => e.name.value)
		);
		persistEntities(data.dbMap, data.subgraphTypes, dbTypes);
		this.getInputValues(data, entities);
	}

	private async getInputValues(
		data: ITypeDefData,
		entities: InputObjectTypeExtensionNode[]
	) {
		const parentFields = entities
			.map((e) => {
				return e.fields
					.map((f) => createField(f, e.name.value, data))
					.flat(1);
			})
			.flat(1);
		await this.fieldRepository.insertIgnoreFields(data.trx, parentFields);
	}
}
