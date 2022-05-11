import {Type, TypePayload} from "../../model/type";
import {Transaction} from "knex";
import {insertBulkPayload, onDuplicateUpdatePayload} from "./utils";

interface TypeService {
	getTypeByName(typeName: string)
	getTypesByNames(typeNames: string[]): Promise<Type[]>
	insertIgnoreTypes(data: TypePayload[]): Promise<void>
	removeTypes(names: string[]): Promise<number>
	removeTypesByService(): Promise<number>
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
		const columns = [
			'name',
			'description',
			'type'
		]
		return this.trx
			.raw(`INSERT INTO ${this.tableName} (${columns.join(',')})
 						VALUES ${insertBulkPayload(data, columns)}
 						ON DUPLICATE KEY UPDATE ${onDuplicateUpdatePayload(columns)}`)
	}

	async removeTypes(names: string[]) {
		return this.trx(this.tableName)
			.whereIn('name', names)
			.delete()
	}

	async removeTypesByService() {
		return this.trx
			.raw(`
				DELETE t
				FROM type_def_types t
				LEFT JOIN type_def_subgraphs tds on t.id = tds.type_id
				WHERE tds.service_id IS NULL;
			`);
	}
}
