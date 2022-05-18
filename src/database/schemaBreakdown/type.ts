import { connection } from '../index';
import { Type, TypePayload } from '../../model/type';
import { Transaction } from 'knex';
import { EntityType } from '../../model/enums';
import {
	Argument,
	Field,
	ParamProvidedBy,
	TypeInstance,
	TypeInstanceDetail,
	TypeInstanceRepository,
} from '../../model/repository';
import { servicesTable } from '../../database/services';
import { camelizeKeys } from 'humps';
import { Service } from '../../model/service';
import { FieldTransactionRepository } from './field';
import { table as operationTableName } from './operations';

interface TypeService extends TypeInstanceRepository {
	getTypesByNames(trx: Transaction, typeNames: String[]): Promise<Type[]>;
	insertIgnoreTypes(trx: Transaction, data: TypePayload[]): Promise<void>;
	countTypesByType(): Promise<TypeCount[]>;
}

type Aliases = FieldAliases;

interface FieldAliases {
	fieldAlias: string;
	fieldTypeAlias: string;
	argumentAssociationAlias: string;
	argumentTypeAlias: string;
	argumentAlias: string;
	usedByTypeAlias: string;
	usedByOperationAlias: string;
	usedByOperationParamAlias: string;
	serviceAlias: string;
}

export type TypeCount = {
	name: EntityType;
	count: number;
};
export class TypeTransactionalRepository implements TypeService {
	private tableName = 'type_def_types';

	constructor() {}

	async getTypesByNames(trx: Transaction, typeNames: String[]) {
		return trx(this.tableName).select().whereIn('name', typeNames);
	}

	async insertIgnoreTypes(
		trx: Transaction,
		data: TypePayload[]
	): Promise<void> {
		const q = `INSERT INTO ${
			this.tableName
		} (name, description, type) VALUES ${this.insertBulkPayload(data)}`;
		return trx.raw(q);
	}

	private insertBulkPayload(data: TypePayload[]): string {
		const insertData = data.map((i) => {
			return `('${i.name}', ${
				i.description !== undefined ? `'${i.description}'` : null
			}, '${i.type}')`;
		});

		return insertData.join(',');
	}

	async countTypesByType() {
		return (await connection(this.tableName)
			.select('type')
			.count('type', { as: 'count' })
			.groupBy('type')) as TypeCount[];
	}

	async listByType(type: string, limit: number, offset: number) {
		const servicesRelationTable = 'type_def_subgraphs';
		const paginatedTypesAlias = 't';
		const typesData = connection(this.tableName)
			.select()
			.where('type', type)
			.limit(limit)
			.offset(offset)
			.as(paginatedTypesAlias);
		const typeInstancesRawData = await connection()
			.select()
			.from(typesData)
			.join(
				servicesRelationTable,
				`${servicesRelationTable}.type_id`,
				'=',
				`${paginatedTypesAlias}.id`
			)
			.join(
				servicesTable,
				`${servicesTable}.id`,
				'=',
				`${servicesRelationTable}.service_id`
			)
			.options({ nestTables: true });

		return this.mapToTypeInstances(
			typeInstancesRawData,
			paginatedTypesAlias
		);
	}

	private mapToTypeInstances(rawData: any[], typeAlias: string) {
		const typeMap = new Map<number, TypeInstance>();
		rawData.forEach((row) => {
			const typeId = row[typeAlias].id;
			if (typeMap.has(typeId)) {
				this.addProvidedByService(
					typeMap,
					typeId,
					camelizeKeys(row[servicesTable]) as Service
				);
			} else {
				typeMap.set(typeId, this.mapToTypeInstance(row, typeAlias));
			}
		});
		return Array.from(typeMap.values());
	}

	private addProvidedByService(
		typeMap: Map<number, TypeInstance>,
		typeId: number,
		service: Service
	) {
		typeMap.get(typeId).providedBy.push(camelizeKeys(service));
	}

	private mapToTypeInstance(
		typeRawData: any,
		typeAlias: string
	): TypeInstance {
		return {
			...typeRawData[typeAlias],
			providedBy: [camelizeKeys(typeRawData[servicesTable])],
		};
	}

	async countByType(type: string) {
		const { totalItems } = (await connection(this.tableName)
			.count('type', { as: 'totalItems' })
			.where('type', type)
			.groupBy('type')
			.first()) as any;

		return totalItems as number;
	}

	async getDetails(id: number): Promise<TypeInstanceDetail> {
		const alias: Aliases = {
			fieldAlias: 'field',
			fieldTypeAlias: 'fieldType',
			argumentAssociationAlias: 'argumentAssociation',
			argumentAlias: 'argument',
			argumentTypeAlias: 'argumentType',
			usedByTypeAlias: 'usedByType',
			usedByOperationParamAlias: 'usedByOperationParam',
			usedByOperationAlias: 'usedByOperation',
			serviceAlias: 'service',
		};
		const result = await connection(this.tableName)
			.select()
			.where(`${this.tableName}.id`, id)
			// fields
			.leftJoin(
				`${FieldTransactionRepository.tableName} as ${alias.fieldAlias}`,
				`${alias.fieldAlias}.parent_type_id`,
				'=',
				`${this.tableName}.id`
			)
			.leftJoin(
				`${this.tableName} as ${alias.fieldTypeAlias}`,
				`${alias.fieldTypeAlias}.id`,
				'=',
				`${alias.fieldAlias}.children_type_id`
			)
			// fields arguments
			.leftJoin(
				`type_def_field_arguments as ${alias.argumentAssociationAlias}`,
				`${alias.argumentAssociationAlias}.field_id`,
				'=',
				`${alias.fieldAlias}.id`
			)
			.leftJoin(
				`${FieldTransactionRepository.tableName} as ${alias.argumentAlias}`,
				`${alias.argumentAlias}.id`,
				'=',
				`${alias.argumentAssociationAlias}.argument_id`
			)
			.leftJoin(
				`${this.tableName} as ${alias.argumentTypeAlias}`,
				`${alias.argumentTypeAlias}.id`,
				'=',
				`${alias.argumentAlias}.children_type_id`
			)
			// implementations
			// TODO: get only required fields in SELECTs
			.options({ nestTables: true });

		// usedBy
		// todos los types que tengan parent_id = id
		const usedByTypesResult = await connection(this.tableName)
			.select()
			.where(`${this.tableName}.id`, id)
			.join(
				`${FieldTransactionRepository.tableName} as ${alias.usedByTypeAlias}`,
				`${alias.usedByTypeAlias}.children_type_id`,
				'=',
				`${this.tableName}.id`
			)
			.join(
				'type_def_subgraphs',
				`type_def_subgraphs.type_id`,
				'=',
				`${this.tableName}.id`
			)
			.join(
				`${servicesTable} as ${alias.serviceAlias}`,
				`${alias.serviceAlias}.id`,
				'=',
				`type_def_subgraphs.service_id`
			)
			.options({ nestTables: true });

		// todos las operations que tengan un output/input con type_id = id
		const usedByOperationResult = await connection(this.tableName)
			.select()
			.where(`${this.tableName}.id`, id)
			.join(
				`type_def_operation_parameters as ${alias.usedByOperationParamAlias}`,
				`${alias.usedByOperationParamAlias}.type_id`,
				'=',
				`${this.tableName}.id`
			)
			.join(
				`${operationTableName} as ${alias.usedByOperationAlias}`,
				`${alias.usedByOperationAlias}.id`,
				'=',
				`${alias.usedByOperationParamAlias}.operation_id`
			)
			.join(
				`${servicesTable} as ${alias.serviceAlias}`,
				`${alias.serviceAlias}.id`,
				'=',
				`${alias.usedByOperationAlias}.service_id`
			)
			.options({ nestTables: true });

		const detail: TypeInstanceDetail = {
			...result[this.tableName],
			fields: this.mapFields(result, alias),
			usedBy: [
				...this.mapUsedByTypes(usedByTypesResult, alias),
				...this.mapUsedByOperations(usedByOperationResult, alias),
			],
		};
		return detail;
	}

	private mapFields(
		rawData: any[],
		{ fieldAlias, fieldTypeAlias, argumentAlias }: FieldAliases
	): Field[] {
		return rawData.reduce((acc: Field[], row) => {
			if (
				row[fieldAlias].id !== null &&
				row[fieldTypeAlias].id !== null
			) {
				acc.push({
					...camelizeKeys(row[fieldAlias]),
					parent: camelizeKeys(row[fieldTypeAlias]),
					arguments: this.mapArguments(rawData, argumentAlias),
				});
			}
			return acc;
		}, []);
	}

	private mapArguments(rawData: any[], argumentAlias: string): Argument[] {
		return [];
	}

	private mapUsedByOperations(
		rawData: any[],
		alias: Aliases
	): ParamProvidedBy[] {
		return rawData.reduce((acc: ParamProvidedBy[], row) => {
			const baseParam = camelizeKeys(
				row[alias.usedByOperationParamAlias]
			);
			acc.push({
				...baseParam,
				key: baseParam.name,
				parent: camelizeKeys(row[alias.usedByOperationAlias]),
				providedBy: camelizeKeys(row[alias.serviceAlias]),
			});
			return acc;
		}, []);
	}

	private mapUsedByTypes(rawData: any[], alias: Aliases): ParamProvidedBy[] {
		// TODO: make sure data from joins is OK
		return [];
	}
}

export default new TypeTransactionalRepository();
