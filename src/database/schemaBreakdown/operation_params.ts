import {Transaction} from 'knex';
import {OperationParam} from "../../model/operation_param";
import {insertBulkPayload, onDuplicateUpdatePayload} from "./utils";


interface OperationParamsService {
	insertIgnoreOperationParams(data: OperationParam[]): Promise<void>
}

export class OperationParamsTransactionalRepository implements OperationParamsService {
	private tableName = 'type_def_operation_parameters';

	constructor(private trx: Transaction) {
	}

	async insertIgnoreOperationParams(data: OperationParam[]) {
		const columns = [
			'name',
			'description',
			'is_nullable',
			'is_array',
			'is_array_nullable',
			'is_output',
			'operation_id',
			'type_id'
		]
		return this.trx
			.raw(`INSERT INTO ${this.tableName} (${columns.join(',')})
 						VALUES ${insertBulkPayload(data, columns)}
 						ON DUPLICATE KEY UPDATE ${onDuplicateUpdatePayload(columns)}`)
	}

}
