import {Type, TypePayload} from "../../model/type";
import {Transaction} from "knex";

interface TypeService {
	getTypeByName(typeName: string)
	getTypesByNames(typeNames: string[]): Promise<Type[]>
	insertIgnoreTypes(data: TypePayload[]): Promise<void>
	removeTypes(names: string[]): Promise<number>
}

export class TypeTransactionalRepository implements TypeService {
	private tableName = 'type_def_types';

	constructor(private trx: Transaction) {
	}

	async getTypeByName(typeName: string) {
		return this.trx(this.tableName)
			.select()
			.where('name', typeName);
	}

	async getTypesByNames(typeNames: string[]) {
		return this.trx(this.tableName)
			.select()
			.whereIn('name', typeNames);
	}

	async insertIgnoreTypes(data: TypePayload[]): Promise<void> {
		const q = `INSERT IGNORE INTO ${this.tableName} (name, description, type) VALUES ${this.insertBulkPayload(data)}`;
		return this.trx
			.raw(q)
	}

	private insertBulkPayload(data: TypePayload[]): string {
		const insertData = data.map(i => {
			return `('${i.name}', ${i.description !== undefined ?`'${i.description}'` : null}, '${i.type}')`;
		})

		return insertData.join(',');
	}

	async removeTypes(names: string[]) {
		return this.trx(this.tableName)
			.whereIn('name', names)
			.delete()
	}
}
