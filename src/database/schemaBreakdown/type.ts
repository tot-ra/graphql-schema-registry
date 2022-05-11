import { connection } from '../index';
import {Type, TypePayload} from "../../model/type";
import {Transaction} from "knex";
import { EntityType } from '../../model/enums';
import { TypeInstance, TypeInstanceRepository } from '../../model/repository';

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
		return (
			await connection(this.tableName)
			.select()
			.where('type', type)
			.limit(limit)
			.offset(offset)
		) as TypeInstance[];
	}

	async countByType(type: string) {
		const { totalItems } = await connection(this.tableName)
			.count('type', { as: 'totalItems' })
			.where('type', type)
			.groupBy('type')
			.first() as any;

		return totalItems as number;
	}
}

export default new TypeTransactionalRepository();