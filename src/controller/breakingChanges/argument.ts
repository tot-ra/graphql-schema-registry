import { Change, ChangeType } from '@graphql-inspector/core';
import { RedisRepository } from '../../redis/redis';
import { FieldTransactionRepository } from '../../database/schemaBreakdown/field';
import { TypeTransactionalRepository } from '../../database/schemaBreakdown/type';
import { getCustomChanges, validateBreakingChange } from './utils';
import { BreakingChangeService } from '../breakingChange';

export class ArgumentChange implements BreakingChangeService {
	private types = [ChangeType.FieldArgumentTypeChanged];

	validate(change: Change) {
		return validateBreakingChange(this.types, change);
	}

	async validateUsage(
		change: Change,
		usage_days: number = 30,
		min_usages: number = 0
	) {
		const redisRepo = RedisRepository.getInstance();

		const split = change.path.split('.');
		const typeName = split[split.length - 3];
		const fieldName = split[split.length - 1];

		const fieldRepo = FieldTransactionRepository.getInstance();
		const typeRepo = TypeTransactionalRepository.getInstance();

		const type = await typeRepo.getTypeByName(typeName);
		const field = await fieldRepo.getFieldByNameAndParent(
			fieldName,
			type.id
		);

		const operations = await redisRepo.getOperationsByUsage(
			field.id,
			'field'
		);

		return getCustomChanges(operations, change, usage_days, min_usages);
	}
}
