import { connection } from '../index';
import { Field, FieldPayload } from '../../model/field';
import { Knex } from 'knex';
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
	static tableName = 'type_def_fields';
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

	async insertIgnoreFields(trx: Knex.Transaction, data: FieldPayload[]) {
		return super.insert(trx, data);
	}

	async getFieldsByNames(
		trx: Knex.Transaction,
		data: string[]
	): Promise<Field[]> {
		return super.get(trx, data, 'name');
	}

	async getFieldByNameAndParent(name: string, parentId: number) {
		return connection(TABLE_NAME)
			.select()
			.where('name', name)
			.andWhere('parent_type_id', parentId)
			.first();
	}

	async getFieldByChildren(childrenId: number): Promise<Field[]> {
		return connection(TABLE_NAME)
			.select()
			.where('children_type_id', childrenId);
	}

	async removeFields(trx: Knex.Transaction, data: string[]) {
		return super.remove(trx, data, 'name');
	}
}
