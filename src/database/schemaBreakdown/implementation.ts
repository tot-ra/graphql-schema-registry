import {Transaction} from "knex";
import {Implementation} from "../../model/implementation";

interface ImplementationService {
	insertIgnoreImplementations(data: Implementation[]): Promise<void>
}

export class ImplementationTransactionRepository implements ImplementationService {
	private tableName = 'type_def_implementations';

	constructor(private trx: Transaction) {
	}

	async insertIgnoreImplementations(data: Implementation[]) {
		return this.trx
			.raw(`INSERT IGNORE INTO ${this.tableName} (interface_id, implementation_id) VALUES ${ImplementationTransactionRepository.insertBulkPayload(data)}`)
	}

	private static insertBulkPayload(data: Implementation[]): string {
		const insertData = data.map(i => {
			return `('${i.interface_id}', ${i.implementation_id}`;
		})

		return insertData.join(',');
	}
}
