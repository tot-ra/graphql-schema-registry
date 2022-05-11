import {Field, FieldPayload} from "../../model/field";
import {Transaction} from "knex";
import {insertBulkPayload, onDuplicateUpdatePayload} from "./utils";

interface FieldService {
	insertIgnoreFields(data: FieldPayload[]): Promise<void>
	getFieldsByNames(typeNames: string[]): Promise<Field[]>
	removeFields(fieldName: string[]): Promise<number>
}

export class FieldTransactionRepository implements FieldService {
	private tableName = 'type_def_fields';

	constructor(private trx: Transaction) {
	}

	async insertIgnoreFields(data: FieldPayload[]) {
		const columns = [
			'name',
			'description',
			'is_nullable',
			'is_array',
			'is_array_nullable',
			'is_deprecated',
			'parent_type_id',
			'children_type_id'
		]
		return this.trx
			.raw(`INSERT INTO ${this.tableName} (${columns.join(',')})
 						VALUES ${insertBulkPayload(data, columns)}
 						ON DUPLICATE KEY UPDATE ${onDuplicateUpdatePayload(columns)}`)
	}

	async getFieldsByNames(typeNames: string[]) {
		return this.trx(this.tableName)
			.select()
			.whereIn('name', typeNames);
	}

	async removeFields(fieldName: string[]) {
		return this.trx(this.tableName)
			.whereIn('name', fieldName)
			.delete()
	}
}
