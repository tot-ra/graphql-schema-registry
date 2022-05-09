import {Type, TypePayload} from "../../model/type";
import {Transaction} from "knex";

interface TypeService {
	getTypesByNames(typeNames: String[]): Promise<Type[]>
	insertTypes(data: TypePayload[]): Promise<void>
}

export class TypeTransactionalRepository implements TypeService {
	private tableName = 'type';

	constructor(private trx: Transaction) {
	}

	async getTypesByNames(typeNames: String[]) {
		return this.trx
			.select()
			.whereIn('name', typeNames);
	}

	async insertTypes(data: TypePayload[]): Promise<void> {
		return this.trx
			.insert(data)
			.into(this.tableName);
	}
}
