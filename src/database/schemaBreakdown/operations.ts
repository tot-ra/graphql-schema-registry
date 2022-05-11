import Knex from 'knex';
import { connection } from '../index';
import { Operation, OperationPayload } from '../../model/operation';
import { OperationType } from '../../model/enums';
import { TypeInstanceRepository } from '../../model/repository';

const table = 'type_def_operations';

interface OperationService extends TypeInstanceRepository {
	insertOperation(trx: Knex, data: OperationPayload): Promise<Operation>
	countOperationsByType(): Promise<OperationCount[]>
	listByType(type: string, limit: number, offset: number): Promise<Operation[]>
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

	async countOperationsByType() {
		return (
			await connection(table)
			.select('type')
			.count('type', { as: 'count' })
			.groupBy('type')
		) as OperationCount[];
	}

	async listByType(type: string, limit: number, offset: number) {
		return (
			await connection(table)
			.select()
			.where('type', type)
			.limit(limit)
			.offset(offset)
		) as Operation[];
	}

	async countByType(type: string) {
		const { totalItems } = await connection(table)
			.count('type', { as: 'totalItems' })
			.where('type', type)
			.groupBy('type')
			.first() as any;

		return totalItems as number;
	}
}

export default new OperationRepository();