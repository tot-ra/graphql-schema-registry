import { Change, ChangeType } from '@graphql-inspector/core';
import { FieldTransactionRepository } from '../../database/schemaBreakdown/field';
import { TypeTransactionalRepository } from '../../database/schemaBreakdown/type';
import {
	getFieldUsageCount,
	getRootFieldUsageCount,
} from '../../helpers/clientUsage/redisHelpers';
import { BreakingChangeService } from '../breakingChange';
import { addUsageToChange, getDateRangeLimits } from './utils';
import { OperationType } from '../../model/enums';
import { OperationTransactionalRepository } from '../../database/schemaBreakdown/operations';

export class ArgumentChange implements BreakingChangeService {
	private readonly types = [ChangeType.FieldArgumentTypeChanged];

	validate(change: Change): boolean {
		return this.types.includes(change.type);
	}

	async validateUsage(change: Change, usageDays = 30, minUsages = 0) {
		const split = change.path.split('.');
		const typeName = split[0];
		const fieldName = split[1];
		const { endDate, startDate } = getDateRangeLimits(usageDays);
		let usageCount: number;

		if (
			typeName.toLowerCase() === OperationType.QUERY ||
			typeName.toLowerCase() === OperationType.MUTATION
		) {
			const operationRepo =
				OperationTransactionalRepository.getInstance();

			const rootField = await operationRepo.getOperationByName(fieldName);

			usageCount = await getRootFieldUsageCount(
				rootField.id,
				startDate,
				endDate
			);
		} else {
			const fieldRepo = FieldTransactionRepository.getInstance();
			const typeRepo = TypeTransactionalRepository.getInstance();

			const type = await typeRepo.getTypeByName(typeName);
			const field = await fieldRepo.getFieldByNameAndParent(
				fieldName,
				type.id
			);

			const { endDate, startDate } = getDateRangeLimits(usageDays);
			usageCount = await getFieldUsageCount(
				type.id,
				field.id,
				startDate,
				endDate
			);
		}
		return addUsageToChange(change, usageCount, minUsages);
	}
}
