import {Transaction} from "knex";
import { Argument } from "../../model/argument";
import {insertBulkPayload, onDuplicateUpdatePayload} from "./utils";

interface ArgumentService {
	insertIgnoreArguments(data: Argument[]): Promise<void>
	removeArguments(fields: number[]): Promise<number>
}

export class ArgumentTransactionRepository implements ArgumentService {
	private tableName = 'type_def_field_arguments';

	constructor(private trx: Transaction) {
	}

	async insertIgnoreArguments(data: Argument[]) {
		const columns = ['field_id', 'argument_id']
		return this.trx
			.raw(`INSERT INTO ${this.tableName} (${columns.join(',')})
 						VALUES ${insertBulkPayload(data, columns)}
 						ON DUPLICATE KEY UPDATE ${onDuplicateUpdatePayload(columns)}`)
	}

	async removeArguments(fields: number[]) {
		return this.trx(this.tableName)
			.whereIn('field_id', fields)
			.delete()
	}
}
