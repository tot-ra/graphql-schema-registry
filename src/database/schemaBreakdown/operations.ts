import Knex, {Transaction} from 'knex';
import {Operation, OperationPayload} from '../../model/operation';


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
		return this.trx
			.raw(`INSERT IGNORE INTO ${this.tableName} (name, description, type, service_id) VALUES ${OperationTransactionalRepository.insertBulkPayload(data)}`)
	}

	private static insertBulkPayload(data: OperationPayload[]): string {
		const insertData = data.map(i => {
			return `('${i.name}', ${i.description !== undefined ?`'${i.description}'` : null}, '${i.type}', ${i.service_id})`;
		})

		return insertData.join(',');
	}

}
