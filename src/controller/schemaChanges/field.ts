import { ITypeDefChangeStrategy, TypeDefChangeStrategy } from './strategy';
import { getChanges } from './utils';
import { FieldTransactionRepository } from '../../database/schemaBreakdown/field';
import { OperationTransactionalRepository } from '../../database/schemaBreakdown/operations';

export class FieldChangeStrategy implements TypeDefChangeStrategy {
	private type = 'field';

	private fieldRepository = FieldTransactionRepository.getInstance();
	private operationRepository =
		OperationTransactionalRepository.getInstance();

	async apply(data: ITypeDefChangeStrategy): Promise<void> {
		const changes = getChanges(data.changesType[this.type], data.changes);
		const splits = changes.map((change) => change.path.split('.'));
		const [fieldNames, operationNames] = splits.reduce(
			(acc, cur) => {
				if (cur[0] === 'Mutation' || cur[0] === 'Query') {
					acc[1].push(cur[cur.length - 1]);
				} else {
					acc[0].push(cur[cur.length - 1]);
				}
				return acc;
			},
			[[], []]
		);
		await this.fieldRepository.removeFields(data.trx, fieldNames);
		await this.operationRepository.removeOperations(
			data.trx,
			operationNames
		);
	}
}
