import { Change, ChangeType } from '@graphql-inspector/core';
import { TypeTransactionalRepository } from '../../database/schemaBreakdown/type';
import { getTypeFieldsUsageCount } from '../../helpers/clientUsage/redisHelpers';
import { BreakingChangeService } from '../breakingChange';
import { addUsageToChange, getDateRangeLimits } from './utils';

export class EnumChange implements BreakingChangeService {
	private types = [ChangeType.EnumValueRemoved];

	validate(change: Change): boolean {
		return this.types.includes(change.type);
	}

	async validateUsage(change: Change, usageDays = 30, minUsages = 0) {
		const split = change.path.split('.');
		const enumName = split[split.length - 2];

		const typeRepo = TypeTransactionalRepository.getInstance();

		const type = await typeRepo.getTypeByName(enumName);

		const { endDate, startDate } = getDateRangeLimits(usageDays);
		const usageCount = await getTypeFieldsUsageCount(
			type.id,
			startDate,
			endDate
		);

		return addUsageToChange(change, usageCount, minUsages);
	}
}
