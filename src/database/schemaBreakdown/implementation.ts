import {Transaction} from "knex";
import {Implementation} from "../../model/implementation";
import {BreakDownRepository} from "./breakdown";

const TABLE_NAME = 'type_def_implementations';
const TABLE_COLUMNS = ['interface_id', 'implementation_id'];

export class ImplementationTransactionRepository extends BreakDownRepository<Implementation, Implementation> {

	constructor() {
		super(TABLE_NAME, TABLE_COLUMNS);
	}

	async insertIgnoreImplementations(trx: Transaction, data: Implementation[]) {
		return super.insert(trx, data);
	}

	async removeImplementations(trx: Transaction, data: string[]) {
		return trx
			.raw(`
			DELETE i FROM ${TABLE_NAME} i
			INNER JOIN type_def_types t on i.implementation_id = t.id
			WHERE t.name IN (${data.map(d => `'${d}'`).join(',')});`)
	}
}
