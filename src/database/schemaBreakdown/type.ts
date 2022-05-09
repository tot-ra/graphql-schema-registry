import {Type, TypePayload} from "../../model/type";
import {Transaction} from "knex";

interface TypeService {
	getTypesByNames(typeNames: String[]): Promise<Type[]>
	insertIgnoreTypes(data: TypePayload[]): Promise<void>
}

export class TypeTransactionalRepository implements TypeService {
	private tableName = 'type_def_types';

	constructor(private trx: Transaction) {
	}

	async getTypesByNames(typeNames: String[]) {
		return this.trx(this.tableName)
			.select()
			.whereIn('name', typeNames);
	}

	async insertIgnoreTypes(data: TypePayload[]): Promise<void> {
		const q = `INSERT INTO ${this.tableName} (name, description, type) VALUES ${this.insertBulkPayload(data)}`;
		return this.trx
			.raw(q)
	}

	private insertBulkPayload(data: TypePayload[]): string {
		const insertData = data.map(i => {
			return `('${i.name}', ${i.description !== undefined ?`'${i.description}'` : null}, '${i.type}')`;
		})

		return insertData.join(',');
	}
}
