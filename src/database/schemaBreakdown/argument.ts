import {Transaction} from "knex";
import { Argument } from "../../model/argument";
import {BreakDownRepository} from "./breakdown";

const TABLE_NAME = 'type_def_field_arguments';
const TABLE_COLUMNS = ['field_id', 'argument_id'];

export class ArgumentTransactionRepository extends BreakDownRepository<Argument, Argument> {

	constructor() {
		super(TABLE_NAME, TABLE_COLUMNS)
	}

	async insertIgnoreArguments(trx: Transaction, data: Argument[], ) {
		return super.insert(trx, data)
	}

	async removeArguments(trx: Transaction, data: number[]) {
		return super.remove(trx, data, 'field_id')
	}
}
