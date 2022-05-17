import {ITypeDefChangeStrategy, TypeDefChangeStrategy} from "./strategy";
import {ImplementationTransactionRepository} from "../../database/schemaBreakdown/implementation";
import {getChanges} from "./utils";

export class ImplementationChangeStrategy implements TypeDefChangeStrategy {
	private type = 'implementation';

	private implementationRepository = ImplementationTransactionRepository.getInstance();

	async apply(data: ITypeDefChangeStrategy): Promise<void> {
		const changes = getChanges(data.changesType[this.type], data.changes);
		const names = changes.map(change => change.path.split('.')[0]);
		await this.implementationRepository.removeImplementations(data.trx, names);
	}
}
