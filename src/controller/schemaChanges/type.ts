import { ITypeDefChangeStrategy, TypeDefChangeStrategy } from './strategy';
import { TypeTransactionalRepository } from '../../database/schemaBreakdown/type';
import { getChanges } from './utils';

export class TypeChangeStrategy implements TypeDefChangeStrategy {
	private type = 'type';

	private typeRepository = TypeTransactionalRepository.getInstance();

	async apply(data: ITypeDefChangeStrategy): Promise<void> {
		const changes = getChanges(data.changesType[this.type], data.changes);
		const names = changes.map((change) => change.path.split('.')[0]);
		await this.typeRepository.removeTypes(data.trx, names);
	}
}
