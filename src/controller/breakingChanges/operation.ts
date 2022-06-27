import { Change, ChangeType } from '@graphql-inspector/core';
import { RedisRepository } from '../../redis/redis';
import { OperationTransactionalRepository } from '../../database/schemaBreakdown/operations';
import { checkUsage, getCustomChanges, validateBreakingChange } from './utils';
import { BreakingChangeService } from '../breakingChange';

export class OperationChange implements BreakingChangeService {
	private types = [];

	validate(change: Change) {
		return validateBreakingChange(this.types, change);
	}

	async validateUsage(
		change: Change,
		usage_days: number = 30,
		min_usages: number = 0
	) {
		const redisRepo = RedisRepository.getInstance();
		const operationRepo = OperationTransactionalRepository.getInstance();

		const split = change.path.split('.');
		const operationName = split[split.length - 1];

		const operation = await operationRepo.getOperationByName(operationName);
		const operations = await redisRepo.getOperationsByUsage(
			operation.id,
			'operation'
		);

		return getCustomChanges(operations, change, usage_days, min_usages);
	}
}
