import {Transaction} from 'knex';
import {OperationParam} from "../../model/operation_param";
import {BreakDownRepository} from "./breakdown";

const TABLE_NAME = 'type_def_operation_parameters';
const TABLE_COLUMNS = [
	'name',
	'description',
	'is_nullable',
	'is_array',
	'is_array_nullable',
	'is_output',
	'operation_id',
	'type_id'
];

export class OperationParamsTransactionalRepository extends BreakDownRepository<OperationParam, OperationParam> {

	private static instance: OperationParamsTransactionalRepository;

	constructor() {
		super(TABLE_NAME, TABLE_COLUMNS);
	}

	static getInstance(): OperationParamsTransactionalRepository {
		if (!OperationParamsTransactionalRepository.instance) {
			OperationParamsTransactionalRepository.instance = new OperationParamsTransactionalRepository();
		}

		return OperationParamsTransactionalRepository.instance;
	}

	async insertIgnoreOperationParams(trx: Transaction, data: OperationParam[]) {
		return super.insert(trx, data);
	}

}
