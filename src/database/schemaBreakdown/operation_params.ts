import {Transaction} from 'knex';
import {OperationParam} from "../../model/operation_param";


interface OperationParamsService {
	insertIgnoreOperationParams(data: OperationParam[]): Promise<void>
}

export class OperationParamsTransactionalRepository implements OperationParamsService {
	private tableName = 'type_def_operation_parameters';

	constructor(private trx: Transaction) {
	}

	async insertIgnoreOperationParams(data: OperationParam[]) {
		return this.trx
			.raw(`INSERT IGNORE INTO ${this.tableName} (name, description, is_nullable, is_array, is_array_nullable, is_output, operation_id, type_id) VALUES ${OperationParamsTransactionalRepository.insertBulkPayload(data)}`)
	}

	private static insertBulkPayload(data: OperationParam[]): string {
		const insertData = data.map(i => {
			return `('${i.name}', ${i.description !== undefined ? `'${i.description}'` : null}, ${i.is_nullable ? 1 : 0}, ${i.is_array ? 1 : 0}, ${i.is_array_nullable ? 1 : 0}, ${i.is_output ? 1 : 0}, ${i.operation_id}, ${i.type_id})`
		})

		return insertData.join(',');
	}

}
