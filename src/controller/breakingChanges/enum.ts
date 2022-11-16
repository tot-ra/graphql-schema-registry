import { Change, ChangeType } from '@graphql-inspector/core';
import { RedisRepository } from '../../redis/redis';
import { FieldTransactionRepository } from '../../database/schemaBreakdown/field';
import { TypeTransactionalRepository } from '../../database/schemaBreakdown/type';
import { checkUsage, validateBreakingChange } from './utils';
import { BreakingChangeService } from '../breakingChange';

export class EnumChange implements BreakingChangeService {
	private types = [ChangeType.EnumValueRemoved];

	validate(change: Change) {
		return validateBreakingChange(this.types, change);
	}

	async validateUsage(change: Change, usage_days = 30, min_usages = 0) {
		const redisRepo = RedisRepository.getInstance();

		const split = change.path.split('.');
		const enumName = split[split.length - 2];

		const fieldRepo = FieldTransactionRepository.getInstance();
		const typeRepo = TypeTransactionalRepository.getInstance();

		const type = await typeRepo.getTypeByName(enumName);
		const fields = await fieldRepo.getFieldByChildren(type.id);

		const resultOperations = await Promise.all(
			fields.map((f) => redisRepo.getOperationsByUsage(f.id, 'field'))
		);

		if (resultOperations.length === 0) {
			return {
				...change,
				isBreakingChange: false,
				totalUsages: 0,
			};
		}

		const resultUsages = await Promise.all(
			resultOperations.map((ro) => checkUsage(ro, usage_days))
		);

		const totalUsages = resultUsages.reduce((acc, cur) => {
			return (acc += cur);
		}, 0);

		return {
			...change,
			isBreakingChange: totalUsages >= min_usages && totalUsages !== 0,
			totalUsages,
		} as any;
	}
}
