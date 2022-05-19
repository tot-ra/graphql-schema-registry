import Knex from 'knex';
import { connection } from '../index';
import { Operation, OperationPayload } from '../../model/operation';
import { OperationType } from '../../model/enums';
import { OperationInstanceDetail, TypeInstance, TypeInstanceRepository } from '../../model/repository';
import { camelizeKeys } from 'humps';

export const table = 'type_def_operations';

interface OperationService extends TypeInstanceRepository {
	insertOperation(trx: Knex, data: OperationPayload): Promise<Operation>;
	countOperationsByType(): Promise<OperationCount[]>;
	listByType(
		type: string,
		limit: number,
		offset: number
	): Promise<TypeInstance[]>;
}

export type OperationCount = {
	name: OperationType;
	count: number;
};

export class OperationRepository implements OperationService {
	async insertOperation(trx: Knex, data: OperationPayload) {
		const id = await trx().insert(data).into(table).returning('id');

		return {
			...data,
			id: 12,
		} as Operation;
	}

	async countOperationsByType() {
		return (await connection(table)
			.select('type')
			.count('type', { as: 'count' })
			.groupBy('type')) as OperationCount[];
	}

	async listByType(type: string, limit: number, offset: number) {
		const servicesTable = 'services';
		const res = await connection(table)
			.select()
			.join( servicesTable, `${servicesTable}.id`, '=', `${table}.service_id`)
			.where('type', type)
			.limit(limit)
			.offset(offset)
			.options({ nestTables: true });

		return res.map((row) => ({
				...camelizeKeys(row[table]),
				providedBy: [camelizeKeys(row[servicesTable])],
			} as TypeInstance)
		);
	}

	async countByType(type: string) {
		const { totalItems } = (await connection(table)
			.count('type', { as: 'totalItems' })
			.where('type', type)
			.groupBy('type')
			.first()) as any;

		return totalItems as number;
	}

	async getDetails(id: number): Promise<OperationInstanceDetail> {
		const result = await connection(table)
			.select()
			.where('id', id)
			.first();
		
		const inputParamsResult = await connection('type_def_params')
		const details: OperationInstanceDetail = {
			...camelizeKeys(result),
			inputParams: this.mapToInputParams(inputParamsResult)
		};
		return details;
	}

	private mapToInputParams(inputParamsResult: any[]) {
		return null;
	}
}

export default new OperationRepository();
