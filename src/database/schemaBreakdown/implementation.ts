import {Transaction} from "knex";
import {Implementation} from "../../model/implementation";
import {insertBulkPayload, onDuplicateUpdatePayload} from "./utils";

interface ImplementationService {
	insertIgnoreImplementations(data: Implementation[]): Promise<void>
	removeImplementations(data: string[]): Promise<number>
}

export class ImplementationTransactionRepository implements ImplementationService {
	private tableName = 'type_def_implementations';

	constructor(private trx: Transaction) {
	}

	async insertIgnoreImplementations(data: Implementation[]) {
		const columns = ['interface_id', 'implementation_id']
		return this.trx
			.raw(`INSERT INTO ${this.tableName} (${columns.join(',')})
 						VALUES ${insertBulkPayload(data, columns)}
 						ON DUPLICATE KEY UPDATE ${onDuplicateUpdatePayload(columns)}`)
	}

	async removeImplementations(data: string[]) {
		return this.trx
			.raw(`
			DELETE i FROM ${this.tableName} i
			INNER JOIN type_def_types t on i.implementation_id = t.id
			WHERE t.name IN (${data.map(d => `'${d}'`).join(',')});`)
	}
}
