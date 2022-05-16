import {Type, TypePayload} from "../../model/type";
import {Transaction} from "knex";
import {BreakDownRepository} from "./breakdown";

const TABLE_NAME = 'type_def_types';
const TABLE_COLUMNS = [
	'name',
	'description',
	'type'
];

export class TypeTransactionalRepository extends BreakDownRepository<TypePayload, Type> {

	constructor() {
		super(TABLE_NAME, TABLE_COLUMNS);
	}

	async getTypeByName(trx: Transaction, name: string) {
		return trx(TABLE_NAME)
			.select()
			.where('name', name);
	}

	async getTypesByNames(trx: Transaction, data: string[]) {
		return super.get(trx, data, 'name')
	}

	async insertIgnoreTypes(trx: Transaction, data: TypePayload[]): Promise<void> {
		return super.insert(trx, data)
	}

	async removeTypes(trx: Transaction, data: string[]) {
		return super.remove(trx, data, 'name')
	}

	async removeTypesByService(trx: Transaction) {
		return trx
			.raw(`
				DELETE t
				FROM type_def_types t
				LEFT JOIN type_def_subgraphs tds on t.id = tds.type_id
				WHERE tds.service_id IS NULL;
			`);
	}
}
