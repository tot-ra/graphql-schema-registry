import Knex, {Transaction} from 'knex';
import {Operation, OperationPayload} from '../../model/operation';
import {insertBulkPayload, onDuplicateUpdatePayload} from "./utils";


interface OperationService {
	insertIgnoreOperations(data: OperationPayload[]): Promise<void>
	getOperationsByNames(names: string[]): Promise<Operation[]>
}

export class OperationTransactionalRepository implements OperationService {
	private tableName = 'type_def_operations';

	constructor(private trx: Transaction) {
	}

	async getOperationsByNames(names: string[]) {
		return this.trx(this.tableName)
			.select()
			.whereIn('name', names);
	}

	async insertIgnoreOperations(data: OperationPayload[]) {
		const columns = [
			'name',
			'description',
			'type',
			'service_id'
		]
		return this.trx
			.raw(`INSERT INTO ${this.tableName} (${columns.join(',')})
 						VALUES ${insertBulkPayload(data, columns)}
 						ON DUPLICATE KEY UPDATE ${onDuplicateUpdatePayload(columns)}`)
	}

}
