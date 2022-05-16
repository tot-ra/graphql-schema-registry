import Knex, {Transaction} from 'knex';
import {Operation, OperationPayload} from '../../model/operation';
import {BreakDownRepository} from "./breakdown";

const TABLE_NAME = 'type_def_operations';
const TABLE_COLUMNS = [
	'name',
	'description',
	'type',
	'service_id'
];

export class OperationTransactionalRepository extends BreakDownRepository<OperationPayload, Operation> {

	private static instance: OperationTransactionalRepository;

	constructor() {
		super(TABLE_NAME, TABLE_COLUMNS);
	}

	static getInstance(): OperationTransactionalRepository {
		if (!OperationTransactionalRepository.instance) {
			OperationTransactionalRepository.instance = new OperationTransactionalRepository();
		}

		return OperationTransactionalRepository.instance;
	}

	async getOperationsByNames(trx: Transaction, data: string[]) {
		return super.get(trx, data, 'name');
	}

	async insertIgnoreOperations(trx: Transaction, data: OperationPayload[]) {
		return super.insert(trx, data);
	}

}
