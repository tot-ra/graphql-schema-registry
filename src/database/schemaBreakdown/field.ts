import { Field, FieldPayload } from '../../model/field';
import { Transaction } from 'knex';
import { BreakDownRepository } from './breakdown';

const TABLE_NAME = 'type_def_fields';
const TABLE_COLUMNS = [
	'name',
	'description',
	'is_nullable',
	'is_array',
	'is_array_nullable',
	'is_deprecated',
	'parent_type_id',
	'children_type_id',
];

export class FieldTransactionRepository extends BreakDownRepository<
	FieldPayload,
	Field
> {
	private static instance: FieldTransactionRepository;

	constructor() {
		super(TABLE_NAME, TABLE_COLUMNS);
	}

	static getInstance(): FieldTransactionRepository {
		if (!FieldTransactionRepository.instance) {
			FieldTransactionRepository.instance =
				new FieldTransactionRepository();
		}

		return FieldTransactionRepository.instance;
	}

	async insertIgnoreFields(trx: Transaction, data: FieldPayload[]) {
		return super.insert(trx, data);
	}

	async getFieldsByNames(trx: Transaction, data: string[]): Promise<Field[]> {
		return super.get(trx, data, 'name');
	}

	async removeFields(trx: Transaction, data: string[]) {
		return super.remove(trx, data, 'name');
	}
}
