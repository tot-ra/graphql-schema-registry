import {ITypeDefData, TypeDefStrategy} from "./strategy";
import {createSubgraphs} from "./utils";
import {SubgraphTransactionalRepository} from "../../database/schemaBreakdown/subgraph";

export class SubgraphStrategy implements TypeDefStrategy<number> {

	private subgraphRepository = SubgraphTransactionalRepository.getInstance();

	getEntities(data: ITypeDefData): number[] {
		return data.subgraphTypes;
	}

	async insertEntities(data: ITypeDefData, entities: number[]): Promise<void> {
		await this.subgraphRepository.insertIgnoreSubGraphs(data.trx, createSubgraphs(data.subgraphTypes, data.service_id))
	}
}
