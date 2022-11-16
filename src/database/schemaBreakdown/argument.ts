import { Knex } from 'knex';
import { Argument } from '../../model/argument';
import { BreakDownRepository } from './breakdown';

const TABLE_NAME = 'type_def_field_arguments';
const TABLE_COLUMNS = ['field_id', 'argument_id'];

export class ArgumentTransactionRepository extends BreakDownRepository<
	Argument,
	Argument
> {
	private static instance: ArgumentTransactionRepository;

	constructor() {
		super(TABLE_NAME, TABLE_COLUMNS);
	}

	static getInstance(): ArgumentTransactionRepository {
		if (!ArgumentTransactionRepository.instance) {
			ArgumentTransactionRepository.instance =
				new ArgumentTransactionRepository();
		}

		return ArgumentTransactionRepository.instance;
	}

	async insertIgnoreArguments(trx: Knex.Transaction, data: Argument[]) {
		return super.insert(trx, data);
	}
}
