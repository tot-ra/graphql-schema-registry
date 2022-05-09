import Knex from 'knex';
import {Operation, OperationPayload} from '../../model/operation';

const table = 'operations';

interface OperationService {
	insertOperation(trx: Knex, data: OperationPayload): Promise<Operation>
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

}
