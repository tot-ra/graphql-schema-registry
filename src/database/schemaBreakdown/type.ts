import { connection } from '../index';
import { Type, TypePayload } from '../../model/type';
import { QueryBuilder, Transaction } from 'knex';
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
import { BreakDownRepository } from './breakdown';

interface TypeService extends TypeInstanceRepository {
	getTypesByNames(trx: Transaction, typeNames: String[]): Promise<Type[]>;
	insertIgnoreTypes(trx: Transaction, data: TypePayload[]): Promise<void>;
	countTypesByType(): Promise<TypeCount[]>;
}

interface TableAliases {
	field: string;
	fieldType: string;
	argumentAssociation: string;
	argumentType: string;
	argument: string;
	usedByType: string;
	usedByOperation: string;
	usedByOperationParam: string;
	service: string;
	usedByTypeParent: string;
	implementationType: string;
	interfaceType: string;
}

export type TypeCount = {
	name: EntityType;
	count: number;
};

const TABLE_NAME = 'type_def_types';
const TABLE_COLUMNS = ['name', 'description', 'type'];
export class TypeTransactionalRepository
	extends BreakDownRepository<TypePayload, Type>
	implements TypeService
{
	private static instance: TypeTransactionalRepository;

	constructor() {
		super(TABLE_NAME, TABLE_COLUMNS);
	}

	static getInstance(): TypeTransactionalRepository {
		if (!TypeTransactionalRepository.instance) {
			TypeTransactionalRepository.instance =
				new TypeTransactionalRepository();
		}

		return TypeTransactionalRepository.instance;
	}

	async getTypeByName(trx: Transaction, name: string) {
		return trx(TABLE_NAME).select().where('name', name);
	}

	async getTypesByNames(trx: Transaction, data: string[]) {
		return super.get(trx, data, 'name');
	}

	async insertIgnoreTypes(
		trx: Transaction,
		data: TypePayload[]
	): Promise<void> {
		return super.insert(trx, data);
	}

	async removeTypes(trx: Transaction, data: string[]) {
		return super.remove(trx, data, 'name');
	}

	async removeTypesByService(trx: Transaction) {
		return trx.raw(`
				DELETE t
				FROM type_def_types t
				LEFT JOIN type_def_subgraphs tds on t.id = tds.type_id
				WHERE tds.service_id IS NULL;
			`);
	}

	async countTypesByType() {
		return (await connection(TABLE_NAME)
			.select('type')
			.count('type', { as: 'count' })
			.groupBy('type')) as TypeCount[];
	}

	async listByType(type: string, limit: number, offset: number) {
		const servicesRelationTable = 'type_def_subgraphs';
		const paginatedTypesAlias = 't';
		const typesData = connection(TABLE_NAME)
			.select()
			.where('type', type)
			.orderBy(`${TABLE_NAME}.name`)
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

	private mapToTypeInstances(rows: any[], typeAlias: string) {
		const typeMap = new Map<number, TypeInstance>();
		rows.forEach((row) => {
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

	private mapToTypeInstance(rows: any, typeAlias: string): TypeInstance {
		return {
			...rows[typeAlias],
			providedBy: [camelizeKeys(rows[servicesTable])],
		};
	}

	async countByType(type: string) {
		const { totalItems } = (await connection(TABLE_NAME)
			.count('type', { as: 'totalItems' })
			.where('type', type)
			.groupBy('type')
			.first()) as any;

		return totalItems as number;
	}

	async getDetails(id: number): Promise<TypeInstanceDetail> {
		const alias: TableAliases = {
			field: 'field',
			fieldType: 'fieldType',
			argumentAssociation: 'argumentAssociation',
			argument: 'argument',
			argumentType: 'argumentType',
			usedByType: 'usedByType',
			usedByOperationParam: 'usedByOperationParam',
			usedByOperation: 'usedByOperation',
			usedByTypeParent: 'usedByTypeParent',
			interfaceType: 'interface',
			implementationType: 'implementationType',
			service: 'service',
		};
		// TODO: get only required fields in SELECTs
		const [
			baseResult,
			fieldsSettledResult,
			usedByTypesResult,
			usedByOperationResult,
			implementationResult,
		] = await this.getAsyncQueryResults([
			this.getTypeByIdQuery(id),
			this.getFieldsQuery(id, alias),
			this.getUsedByTypesQuery(id, alias),
			this.getUsedByOperationQuery(id, alias),
			this.getImplementationQuery(id, alias),
		]);

		return {
			...baseResult,
			fields: this.mapFields(fieldsSettledResult || [], alias),
			usedBy: [
				...this.mapUsedByTypes(usedByTypesResult || [], alias),
				...this.mapUsedByOperations(usedByOperationResult || [], alias),
			],
			implementations: this.mapImplementations(
				implementationResult || [],
				alias
			),
		} as TypeInstanceDetail;
	}

	private async getAsyncQueryResults(queries: any[]) {
		const settledResults = await Promise.allSettled(queries);
		return settledResults.map((r) => this.getSettledValue(r));
	}

	private getSettledValue(settled: PromiseSettledResult<any>): any | null {
		return settled.status === 'fulfilled' ? settled.value : null;
	}

	private getTypeByIdQuery(id: number): QueryBuilder {
		return connection(TABLE_NAME)
			.select()
			.where(`${TABLE_NAME}.id`, id)
			.first();
	}

	private getFieldsQuery(id: number, alias: TableAliases): QueryBuilder {
		return connection(TABLE_NAME)
			.select()
			.where(`${TABLE_NAME}.id`, id)
			.leftJoin(
				`${FieldTransactionRepository.tableName} as ${alias.field}`,
				`${alias.field}.parent_type_id`,
				'=',
				`${TABLE_NAME}.id`
			)
			.leftJoin(
				`${TABLE_NAME} as ${alias.fieldType}`,
				`${alias.fieldType}.id`,
				'=',
				`${alias.field}.children_type_id`
			)
			.leftJoin(
				`type_def_field_arguments as ${alias.argumentAssociation}`,
				`${alias.argumentAssociation}.field_id`,
				'=',
				`${alias.field}.id`
			)
			.leftJoin(
				`${FieldTransactionRepository.tableName} as ${alias.argument}`,
				`${alias.argument}.id`,
				'=',
				`${alias.argumentAssociation}.argument_id`
			)
			.leftJoin(
				`${TABLE_NAME} as ${alias.argumentType}`,
				`${alias.argumentType}.id`,
				'=',
				`${alias.argument}.children_type_id`
			)
			.options({ nestTables: true });
	}

	private getUsedByTypesQuery(id: number, alias: TableAliases): QueryBuilder {
		return connection(TABLE_NAME)
			.select()
			.where(`${TABLE_NAME}.id`, id)
			.join(
				`${FieldTransactionRepository.tableName} as ${alias.usedByType}`,
				`${alias.usedByType}.children_type_id`,
				'=',
				`${TABLE_NAME}.id`
			)
			.join(
				`${TABLE_NAME} as ${alias.usedByTypeParent}`,
				`${alias.usedByTypeParent}.id`,
				'=',
				`${alias.usedByType}.parent_type_id`
			)
			.join(
				'type_def_subgraphs',
				`type_def_subgraphs.type_id`,
				'=',
				`${alias.usedByTypeParent}.id`
			)
			.join(
				`${servicesTable} as ${alias.service}`,
				`${alias.service}.id`,
				'=',
				`type_def_subgraphs.service_id`
			)
			.options({ nestTables: true });
	}

	private getUsedByOperationQuery(
		id: number,
		alias: TableAliases
	): QueryBuilder {
		const operationParamsTableName = 'type_def_operation_parameters';
		return connection(TABLE_NAME)
			.select()
			.where(`${TABLE_NAME}.id`, id)
			.join(
				`${operationParamsTableName} as ${alias.usedByOperationParam}`,
				`${alias.usedByOperationParam}.type_id`,
				'=',
				`${TABLE_NAME}.id`
			)
			.join(
				`${operationTableName} as ${alias.usedByOperation}`,
				`${alias.usedByOperation}.id`,
				'=',
				`${alias.usedByOperationParam}.operation_id`
			)
			.join(
				`${servicesTable} as ${alias.service}`,
				`${alias.service}.id`,
				'=',
				`${alias.usedByOperation}.service_id`
			)
			.options({ nestTables: true });
	}

	private getImplementationQuery(
		id: number,
		alias: TableAliases
	): QueryBuilder {
		const implementationTableName = 'type_def_implementations';
		const subgraphTableName = 'type_def_subgraphs';
		return connection(implementationTableName)
			.select()
			.where(`${implementationTableName}.interface_id`, id)
			.join(
				`${TABLE_NAME} as ${alias.interfaceType}`,
				`${alias.interfaceType}.id`,
				'=',
				`${implementationTableName}.interface_id`
			)
			.join(
				`${TABLE_NAME} as ${alias.implementationType}`,
				`${alias.implementationType}.id`,
				'=',
				`${implementationTableName}.implementation_id`
			)
			.join(
				subgraphTableName,
				`${subgraphTableName}.type_id`,
				'=',
				`${alias.implementationType}.id`
			)
			.join(
				`${servicesTable} as ${alias.service}`,
				`${alias.service}.id`,
				'=',
				`${subgraphTableName}.service_id`
			)
			.options({ nestTables: true });
	}

	private mapFields(rows: any[], alias: TableAliases): Field[] {
		const fieldMap = new Map<number, Field>();
		rows.forEach((row) => {
			if (
				row[alias.field].id !== null &&
				row[alias.fieldType].id !== null
			) {
				const baseField = camelizeKeys(row[alias.field]);
				fieldMap.set(baseField.id, {
					...baseField,
					key: baseField.name,
					parent: camelizeKeys(row[alias.fieldType]),
					arguments: this.mapArguments(rows, baseField.id, alias),
				});
			}
		});
		return Array.from(fieldMap.values());
	}

	private mapArguments(
		rows: any[],
		fieldId: number,
		alias: TableAliases
	): Argument[] {
		const fields = rows.filter((row) => row[alias.field].id === fieldId);
		return fields.reduce((acc: Argument[], row) => {
			if (row[alias.argument].id !== null) {
				const argument: Argument = {
					...camelizeKeys(row[alias.argument]),
					parent: camelizeKeys(row[alias.argumentType]),
				};
				acc.push(argument);
			}
			return acc;
		}, []);
	}

	private mapUsedByTypes(
		rows: any[],
		alias: TableAliases
	): ParamProvidedBy[] {
		return rows.reduce((acc: ParamProvidedBy[], row) => {
			const baseParam = camelizeKeys(row[alias.usedByType]);
			acc.push({
				...baseParam,
				key: baseParam.name,
				parent: camelizeKeys(row[alias.usedByTypeParent]),
				providedBy: camelizeKeys(row[alias.service]),
			});
			return acc;
		}, []);
	}

	private mapUsedByOperations(
		rows: any[],
		alias: TableAliases
	): ParamProvidedBy[] {
		return rows.reduce((acc: ParamProvidedBy[], row) => {
			const baseParam = camelizeKeys(row[alias.usedByOperationParam]);
			acc.push({
				...baseParam,
				key: baseParam.name,
				parent: camelizeKeys(row[alias.usedByOperation]),
				providedBy: camelizeKeys(row[alias.service]),
			});
			return acc;
		}, []);
	}

	private mapImplementations(
		rows: any[],
		alias: TableAliases
	): ParamProvidedBy[] {
		return rows.reduce((acc: ParamProvidedBy[], row) => {
			const baseImplementation = camelizeKeys(
				row[alias.implementationType]
			);
			acc.push({
				...baseImplementation,
				key: baseImplementation.name,
				parent: camelizeKeys(row[alias.interfaceType]),
				providedBy: camelizeKeys(row[alias.service]),
			});
			return acc;
		}, []);
	}
}
