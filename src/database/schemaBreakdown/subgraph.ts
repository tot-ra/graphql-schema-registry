import {Transaction} from 'knex';
import {Subgraph} from "../../model/subgraph";

interface OperationParamsService {
	insertIgnoreSubGraphs(data: Subgraph[]): Promise<void>
}

export class SubgraphTransactionalRepository implements OperationParamsService {
	private tableName = 'type_def_subgraphs';

	constructor(private trx: Transaction) {
	}

	async insertIgnoreSubGraphs(data: Subgraph[]) {
		return this.trx
			.raw(`INSERT IGNORE INTO ${this.tableName} (service_id, type_id) VALUES ${SubgraphTransactionalRepository.insertBulkPayload(data)}`)
	}

	private static insertBulkPayload(data: Subgraph[]): string {
		const insertData = data.map(i => {
			return `(${i.service_id}, ${i.type_id})`
		})

		return insertData.join(',');
	}

}
