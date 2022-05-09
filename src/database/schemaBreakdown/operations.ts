import Knex from 'knex';
import { connection } from '../index';
import { Operation, OperationPayload } from '../../model/operation';
import { OperationType } from '../../model/enums';

const table = 'type_def_operations';

interface OperationService {
	insertOperation(trx: Knex, data: OperationPayload): Promise<Operation>
	listOperations(): Promise<OperationCount[]>
}

export type OperationCount = {
	name: OperationType;
	count: number;
}
export class OperationRepository implements OperationService {
	async insertOperation(trx: Knex, data: OperationPayload) {
		const id = await trx()
			.insert(data)
			.into(table)
			.returning('id');

		return {
			...data,
			id: 12
		} as Operation
	}

	async listOperations() {
		return (
			await connection(table)
			.select('type')
			.count('type', { as: 'count' })
			.groupBy('type')
		) as OperationCount[];
	}
}

export default new OperationRepository();