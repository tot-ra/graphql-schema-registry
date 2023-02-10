import { Change, ChangeType } from '@graphql-inspector/core';
import { FieldTransactionRepository } from '../../database/schemaBreakdown/field';
import { TypeTransactionalRepository } from '../../database/schemaBreakdown/type';
import { getFieldUsageCount } from '../../helpers/clientUsage/redisHelpers';
import { BreakingChangeService } from '../breakingChange';
import { addUsageToChange, getDateRangeLimits } from './utils';

export class ArgumentChange implements BreakingChangeService {
	private readonly types = [ChangeType.FieldArgumentTypeChanged];

	validate(change: Change): boolean {
		return this.types.includes(change.type);
	}

	async validateUsage(change: Change, usageDays = 30, minUsages = 0) {
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

		const { endDate, startDate } = getDateRangeLimits(usageDays);
		const usageCount = await getFieldUsageCount(
			type.id,
			field.id,
			startDate,
			endDate
		);
		return addUsageToChange(change, usageCount, minUsages);
	}
}
