import {Transaction} from "knex";
import { Argument } from "../../model/argument";

interface ArgumentService {
	insertIgnoreArguments(data: Argument[]): Promise<void>
}

export class ArgumentTransactionRepository implements ArgumentService {
	private tableName = 'type_def_field_arguments';

	constructor(private trx: Transaction) {
	}

	async insertIgnoreArguments(data: Argument[]) {
		return this.trx
			.raw(`INSERT IGNORE INTO ${this.tableName} (field_id, argument_id) VALUES ${ArgumentTransactionRepository.insertBulkPayload(data)}`)
	}

	private static insertBulkPayload(data: Argument[]): string {
		const insertData = data.map(i => {
			return `(${i.field_id}, ${i.argument_id})`;
		})

		return insertData.join(',');
	}
}
