import {Transaction} from "knex";
import { Argument } from "../../model/argument";
import {BreakDownRepository} from "./breakdown";

const TABLE_NAME = 'type_def_field_arguments';
const TABLE_COLUMNS = ['field_id', 'argument_id'];

export class ArgumentTransactionRepository extends BreakDownRepository<Argument, Argument> {

	private static instance: ArgumentTransactionRepository;

	constructor() {
		super(TABLE_NAME, TABLE_COLUMNS);
	}

	static getInstance(): ArgumentTransactionRepository {
		if (!ArgumentTransactionRepository.instance) {
			ArgumentTransactionRepository.instance = new ArgumentTransactionRepository();
		}

		return ArgumentTransactionRepository.instance;
	}

	async insertIgnoreArguments(trx: Transaction, data: Argument[], ) {
		return super.insert(trx, data)
	}

	async removeArguments(trx: Transaction, data: string[]) {
		return trx
			.raw(`
			DELETE i FROM ${TABLE_NAME} i
			INNER JOIN type_def_types t on i.field_id = t.id
			WHERE t.name IN (${data.map(d => `'${d}'`).join(',')});`)
	}
}
