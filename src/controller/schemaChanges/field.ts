import { ITypeDefChangeStrategy, TypeDefChangeStrategy } from './strategy';
import { getChanges } from './utils';
import { FieldTransactionRepository } from '../../database/schemaBreakdown/field';

export class FieldChangeStrategy implements TypeDefChangeStrategy {
	private type = 'field';

	private fieldRepository = FieldTransactionRepository.getInstance();

	async apply(data: ITypeDefChangeStrategy): Promise<void> {
		const changes = getChanges(data.changesType[this.type], data.changes);
		const splits = changes.map((change) => change.path.split('.'));
		const names = splits.map((split) => split[split.length - 1]);
		await this.fieldRepository.removeFields(data.trx, names);
	}
}
