import { Change, ChangeType } from '@graphql-inspector/core';
import { RedisRepository } from '../../redis/redis';
import { TypeTransactionalRepository } from '../../database/schemaBreakdown/type';
import { getCustomChanges, validateBreakingChange } from './utils';
import { BreakingChangeService } from '../breakingChange';

export class InterfaceChange implements BreakingChangeService {
	private types = [ChangeType.ObjectTypeInterfaceRemoved];

	validate(change: Change) {
		return validateBreakingChange(this.types, change);
	}

	async validateUsage(
		change: Change,
		usage_days: number = 30,
		min_usages: number = 0
	) {
		const redisRepo = RedisRepository.getInstance();

		const typeRepo = TypeTransactionalRepository.getInstance();
		const type = await typeRepo.getTypeByName(change.path);

		const operations = await redisRepo.getOperationsByUsage(
			type.id,
			'entity'
		);

		return getCustomChanges(operations, change, usage_days, min_usages);
	}
}
