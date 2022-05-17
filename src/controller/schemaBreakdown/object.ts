import {ITypeDefData, TypeDefStrategy} from "./strategy";
import {ObjectTypeExtensionNode} from "graphql/language/ast";
import {DocumentNodeType, EntityType, OperationType} from "../../model/enums";
import {TypeTransactionalRepository} from "../../database/schemaBreakdown/type";
import {createField, createOperationParam, createOperations, createTypes, persistEntities} from "./utils";
import {Type} from "../../model/type";
import {FieldTransactionRepository} from "../../database/schemaBreakdown/field";
import {FieldPayload} from "../../model/field";
import {Argument} from "../../model/argument";
import {ArgumentTransactionRepository} from "../../database/schemaBreakdown/argument";
import {Implementation} from "../../model/implementation";
import {ImplementationTransactionRepository} from "../../database/schemaBreakdown/implementation";
import {Operation} from "../../model/operation";
import {OperationTransactionalRepository} from "../../database/schemaBreakdown/operations";
import {OperationParamsTransactionalRepository} from "../../database/schemaBreakdown/operation_params";
import {OperationParam} from "../../model/operation_param";

export class ObjectStrategy implements TypeDefStrategy<ObjectTypeExtensionNode> {
	private type = DocumentNodeType.OBJECT;
	private INVALID_OBJECTS = ['Query', 'Mutation', 'Subscription']

	private typeRepository = TypeTransactionalRepository.getInstance();
	private fieldRepository = FieldTransactionRepository.getInstance();
	private argumentRepository = ArgumentTransactionRepository.getInstance();
	private implementationRepository = ImplementationTransactionRepository.getInstance();
	private operationsRepository = OperationTransactionalRepository.getInstance();
	private operationsParamsRepository = OperationParamsTransactionalRepository.getInstance();

	getEntities(data: ITypeDefData): ObjectTypeExtensionNode[] {
		return data.mappedTypes.get(this.type) ?? [];
	}

	async insertEntities(data: ITypeDefData, entities: ObjectTypeExtensionNode[]): Promise<void> {
		if (entities.length === 0) {
			return;
		}
		const notOperations = entities
			.filter(obj => !this.INVALID_OBJECTS.includes(obj.name.value));
		const operations = entities
			.filter(obj => this.INVALID_OBJECTS.includes(obj.name.value))
		const types = createTypes(notOperations, EntityType.OBJECT);
		await this.typeRepository.insertIgnoreTypes(data.trx, types);
		const dbTypes: Type[] = await this.typeRepository.getTypesByNames(data.trx, notOperations.map(e => e.name.value));
		persistEntities(data.dbMap, data.subgraphTypes, dbTypes);
		const fields = this.getObjectFields(data, notOperations);
		await this.fieldRepository.insertIgnoreFields(data.trx, fields);
		const args = await this.getArgumentFields(data, notOperations, fields);
		await this.argumentRepository.insertIgnoreArguments(data.trx, args);
		const implementations = this.getImplementations(data, notOperations);
		await this.implementationRepository.insertIgnoreImplementations(data.trx, implementations);
		const ops = this.getOperations(data, operations);
		await this.operationsRepository.insertIgnoreOperations(data.trx, ops);
		const dbOps: Operation[] = await this.operationsRepository.getOperationsByNames(data.trx, ops.map(o => o.name))
		dbOps.forEach(o => data.dbMap.set(o.name, o.id))
		const opsParams = this.getOperationParams(data, operations);
		await this.operationsParamsRepository.insertIgnoreOperationParams(data.trx, opsParams);
	}

	private getObjectFields(data: ITypeDefData, entities: ObjectTypeExtensionNode[]): FieldPayload[] {
		return entities
		.map(o => {
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

	private getImplementations(data: ITypeDefData, entities: ObjectTypeExtensionNode[]): Implementation[] {
		return entities.map(o => {
			return o.interfaces.map(i => {
				return {
					implementation_id: data.dbMap.get(o.name.value),
					interface_id: data.dbMap.get(i.name.value)
				} as Implementation
			})
		}).flat(1);
	}

	private getOperations(data: ITypeDefData, entities: ObjectTypeExtensionNode[]): Operation[] {
		const queries = entities.filter(e => e.name.value === 'Query');
		const mutations = entities.filter(e => e.name.value === 'Mutation');
		return [
			...createOperations(queries.map(o => o.fields).flat(1), OperationType.QUERY, data.service_id),
			...createOperations(mutations.map(o => o.fields).flat(1), OperationType.MUTATION, data.service_id)
		]
	}

	private getOperationParams(data: ITypeDefData, entities: ObjectTypeExtensionNode[]): OperationParam[] {
		return entities.map(o => {
			return o.fields.map(f => {
				const parentName = f.name.value;
				const output = createOperationParam(f, parentName, true, data);
				const inputs = f.arguments.map(a => createOperationParam(a, parentName, false, data))
				return [output, ...inputs]
			}).flat(1)
		}).flat(1);
	}
}
