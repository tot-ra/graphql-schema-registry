import { ITypeDefData, TypeDefStrategy } from './strategy';
import {
	DirectiveDefinitionNode,
	EnumTypeDefinitionNode,
	InputObjectTypeDefinitionNode,
	ObjectTypeDefinitionNode,
	ScalarTypeExtensionNode,
} from 'graphql/language/ast';
import { DocumentNodeType, EntityType } from '../../model/enums';
import { TypeTransactionalRepository } from '../../database/schemaBreakdown/type';
import { Type } from '../../model/type';
import { createTypes, persistEntities } from './utils';

type PotentialScalarTypes =
	| ObjectTypeDefinitionNode
	| InputObjectTypeDefinitionNode
	| DirectiveDefinitionNode
	| EnumTypeDefinitionNode;

export class ScalarStrategy
	implements TypeDefStrategy<ScalarTypeExtensionNode>
{
	private type = DocumentNodeType.SCALAR;
	private BASE_SCALARS = ['Int', 'String', 'Boolean', 'Float', 'ID'];

	private typeRepository = TypeTransactionalRepository.getInstance();

	getEntities(data: ITypeDefData): ScalarTypeExtensionNode[] {
		const newScalars = data.mappedTypes.get(this.type) ?? [];
		const existingScalars = this.getExistingScalars(data);
		const internalScalars = [...newScalars, ...existingScalars];
		if (data.mappedTypes.has(DocumentNodeType.ENUM)) {
			internalScalars.push({
				kind: 'ScalarTypeExtension',
				name: {
					kind: 'Name',
					value: 'String',
				},
			} as ScalarTypeExtensionNode);
		}
		return internalScalars.filter(Boolean).filter((value, index, self) => {
			{
				return (
					index ===
					self.findIndex((t) => {
						return t?.name.value === value?.name.value;
					})
				);
			}
		});
	}

	async insertEntities(
		data: ITypeDefData,
		entities: ScalarTypeExtensionNode[]
	): Promise<void> {
		if (entities.length === 0) {
			return;
		}
		await this.typeRepository.insertIgnoreTypes(
			data.trx,
			createTypes(entities, EntityType.SCALAR)
		);
		const dbTypes: Type[] = await this.typeRepository.getTypesByNames(
			data.trx,
			entities.map((e) => e.name.value)
		);
		persistEntities(data.dbMap, data.subgraphTypes, dbTypes);
	}

	private getExistingScalars(data: ITypeDefData): ScalarTypeExtensionNode[] {
		const types: PotentialScalarTypes[] = [
			...(data.mappedTypes.get(DocumentNodeType.OBJECT) ?? []),
			...(data.mappedTypes.get(DocumentNodeType.INPUT) ?? []),
			...(data.mappedTypes.get(DocumentNodeType.DIRECTIVE) ?? []),
		];

		return types
			.map((type) => {
				const args = [
					...('arguments' in type
						? type.arguments.map((a) =>
								this.getInternalScalars(a.type)
						  )
						: []),
				];
				const fields =
					'fields' in type
						? type.fields
								?.map((f) => {
									return [
										this.getInternalScalars(f.type),
										...('arguments' in f
											? f.arguments?.map((a) =>
													this.getInternalScalars(
														a.type
													)
											  )
											: []),
									];
								})
								.flat(1)
						: [];
				return [...args, ...fields];
			})
			.flat(1);
	}

	private getInternalScalars(field: any): ScalarTypeExtensionNode {
		while (field.type) {
			field = field.type;
		}
		const name = field.name.value;
		if (!this.BASE_SCALARS.includes(name)) {
			return null;
		}
		return {
			kind: 'ScalarTypeExtension',
			name: field.name,
		};
	}
}
