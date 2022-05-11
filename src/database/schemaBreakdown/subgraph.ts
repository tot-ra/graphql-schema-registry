import {Transaction} from 'knex';
import {Subgraph} from "../../model/subgraph";
import {insertBulkPayload, onDuplicateUpdatePayload} from "./utils";

interface OperationParamsService {
	insertIgnoreSubGraphs(data: Subgraph[]): Promise<void>
}

export class SubgraphTransactionalRepository implements OperationParamsService {
	private tableName = 'type_def_subgraphs';

	constructor(private trx: Transaction) {
	}

	async insertIgnoreSubGraphs(data: Subgraph[]) {
		const columns = ['service_id', 'type_id']
		return this.trx
			.raw(`INSERT INTO ${this.tableName} (${columns.join(',')})
 						VALUES ${insertBulkPayload(data, columns)}
 						ON DUPLICATE KEY UPDATE ${onDuplicateUpdatePayload(columns)}`)
	}
}
