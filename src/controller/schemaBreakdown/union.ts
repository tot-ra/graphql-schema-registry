import { ITypeDefData, TypeDefStrategy } from './strategy';
import { EnumTypeExtensionNode, UnionTypeExtensionNode } from 'graphql';
import { DocumentNodeType, EntityType } from '../../model/enums';
import { TypeTransactionalRepository } from '../../database/schemaBreakdown/type';
import { createTypes, persistEntities } from './utils';
import { Type } from '../../model/type';

export class UnionStrategy implements TypeDefStrategy<UnionTypeExtensionNode> {
	private type = DocumentNodeType.UNION;

	private typeRepository = TypeTransactionalRepository.getInstance();

	getEntities(data: ITypeDefData): UnionTypeExtensionNode[] {
		return data.mappedTypes.get(this.type) ?? [];
	}

	async insertEntities(
		data: ITypeDefData,
		entities: UnionTypeExtensionNode[]
	): Promise<void> {
		if (entities.length === 0) {
			return;
		}
		const types = createTypes(entities, EntityType.OBJECT);
		await this.typeRepository.insertIgnoreTypes(data.trx, types);
		const dbTypes: Type[] = await this.typeRepository.getTypesByNames(
			data.trx,
			entities.map((e) => e.name.value)
		);
		persistEntities(data.dbMap, data.subgraphTypes, dbTypes);
	}
}
