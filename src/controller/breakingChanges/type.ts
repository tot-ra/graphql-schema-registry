import { Change, ChangeType } from '@graphql-inspector/core';
import { RedisRepository } from '../../redis/redis';
import { TypeTransactionalRepository } from '../../database/schemaBreakdown/type';
import { checkUsage, getCustomChanges, validateBreakingChange } from './utils';
import { BreakingChangeService } from '../breakingChange';

export class TypeChange implements BreakingChangeService {
	private types = [ChangeType.TypeRemoved, ChangeType.DirectiveRemoved];

	validate(change: Change) {
		return validateBreakingChange(this.types, change);
	}

	async validateUsage(change: Change, usage_days = 30, min_usages = 0) {
		const redisRepo = RedisRepository.getInstance();
		const typeRepo = TypeTransactionalRepository.getInstance();

		const split = change.path.split('.');

		const typeName = split[0];

		if (typeName === 'Mutation' || typeName === 'Query') {
			return {
				...change,
				isBreakingChange: false,
				totalUsages: 0,
			};
		}

		const type = await typeRepo.getTypeByName(typeName);
		const operations = await redisRepo.getOperationsByUsage(
			type.id,
			'entity'
		);

		return getCustomChanges(operations, change, usage_days, min_usages);
	}
}
