import { connection } from '../index';
import {Type, TypePayload} from "../../model/type";
import {Transaction} from "knex";
import { EntityType } from '../../model/enums';
import { TypeInstance, TypeInstanceDetail, TypeInstanceRepository } from '../../model/repository';
import { servicesTable } from '../../database/services';
import { camelizeKeys } from 'humps';
import { Service } from '../../model/service';
import { FieldTransactionRepository } from './field';

interface TypeService extends TypeInstanceRepository {
	getTypesByNames(trx: Transaction, typeNames: String[]): Promise<Type[]>
	insertIgnoreTypes(trx: Transaction, data: TypePayload[]): Promise<void>
	countTypesByType(): Promise<TypeCount[]>
}

export type TypeCount = {
	name: EntityType;
	count: number;
}
export class TypeTransactionalRepository implements TypeService {
	private tableName = 'type_def_types';

	constructor() {
	}

	async getTypesByNames(trx: Transaction, typeNames: String[]) {
		return trx(this.tableName)
			.select()
			.whereIn('name', typeNames);
	}

	async insertIgnoreTypes(trx: Transaction, data: TypePayload[]): Promise<void> {
		const q = `INSERT INTO ${this.tableName} (name, description, type) VALUES ${this.insertBulkPayload(data)}`;
		return trx
			.raw(q)
	}

	private insertBulkPayload(data: TypePayload[]): string {
		const insertData = data.map(i => {
			return `('${i.name}', ${i.description !== undefined ?`'${i.description}'` : null}, '${i.type}')`;
		})

		return insertData.join(',');
	}

	async countTypesByType() {
		return (
			await connection(this.tableName)
			.select('type')
			.count('type', { as: 'count' })
			.groupBy('type')
		) as TypeCount[];
	}

	async listByType(type: string, limit: number, offset: number) {
		const servicesRelationTable = 'type_def_subgraphs';
		const paginatedTypesAlias = 't';
		const typesData = connection(this.tableName)
			.select()	
			.where('type', type)
			.limit(limit)
			.offset(offset)
			.as(paginatedTypesAlias)
		const typeInstancesRawData = await connection()
			.select()
			.from(typesData)
			.join(servicesRelationTable, `${servicesRelationTable}.type_id`, '=', `${paginatedTypesAlias}.id`)
			.join(servicesTable, `${servicesTable}.id`, '=', `${servicesRelationTable}.service_id`)
			.options({ nestTables: true })

		return this.mapToTypeInstances(typeInstancesRawData, paginatedTypesAlias);
	}

	private mapToTypeInstances(rawData: any[], typeAlias: string) {
		const typeMap = new Map<number, TypeInstance>();
		rawData.forEach(row => {
			const typeId = row[typeAlias].id;
			if (typeMap.has(typeId)) {
				this.addProvidedByService(typeMap, typeId, camelizeKeys(row[servicesTable]) as Service);
			} else {
				typeMap.set(typeId, this.mapToTypeInstance(row, typeAlias));
			}
		});
		return Array.from(typeMap.values());
	}

	private addProvidedByService(typeMap: Map<number, TypeInstance>, typeId: number, service: Service) {
		typeMap.get(typeId).providedBy.push(camelizeKeys(service));
	}

	private mapToTypeInstance(typeRawData: any, typeAlias: string): TypeInstance {
		return {
			...typeRawData[typeAlias],
			providedBy: [camelizeKeys(typeRawData[servicesTable])]
		};
	}

	async countByType(type: string) {
		const { totalItems } = await connection(this.tableName)
			.count('type', { as: 'totalItems' })
			.where('type', type)
			.groupBy('type')
			.first() as any;

		return totalItems as number;
	}

	async getDetails(id: number): Promise<TypeInstanceDetail> {
		const fieldTypeNameAlias = 'ftn';
		const fieldTypeAlias = 'ft';
		const result = await connection(this.tableName)
			.select()
			.where(`${this.tableName}.id`, id)
			// fields
			.leftJoin(`${FieldTransactionRepository.tableName} as ${fieldTypeNameAlias}`, `${fieldTypeNameAlias}.parent_type_id`, '=', `${this.tableName}.id`)
			.leftJoin(`${this.tableName} as ${fieldTypeAlias}`, `${fieldTypeNameAlias}.children_type_id`, '=', `${fieldTypeAlias}.id`)
			 // inputParams
			 
			// outputParams
			// usedBy
			// implementations
			.options({ nestTables: true })
		throw new Error('Not implemented');
	}
}

export default new TypeTransactionalRepository();