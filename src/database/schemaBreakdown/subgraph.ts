import { Transaction } from 'knex';
import { Subgraph } from '../../model/subgraph';
import { BreakDownRepository } from './breakdown';

const TABLE_NAME = 'type_def_subgraphs';
const TABLE_COLUMNS = ['service_id', 'type_id'];

export class SubgraphTransactionalRepository extends BreakDownRepository<
	Subgraph,
	Subgraph
> {
	private static instance: SubgraphTransactionalRepository;

	constructor() {
		super(TABLE_NAME, TABLE_COLUMNS);
	}

	static getInstance(): SubgraphTransactionalRepository {
		if (!SubgraphTransactionalRepository.instance) {
			SubgraphTransactionalRepository.instance =
				new SubgraphTransactionalRepository();
		}

		return SubgraphTransactionalRepository.instance;
	}

	async insertIgnoreSubGraphs(trx: Transaction, data: Subgraph[]) {
		return super.insert(trx, data);
	}
}
