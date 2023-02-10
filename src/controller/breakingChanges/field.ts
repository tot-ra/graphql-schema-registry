import { Change, ChangeType } from '@graphql-inspector/core';
import { FieldTransactionRepository } from '../../database/schemaBreakdown/field';
import { OperationTransactionalRepository } from '../../database/schemaBreakdown/operations';
import { TypeTransactionalRepository } from '../../database/schemaBreakdown/type';
import {
	getFieldUsageCount,
	getRootFieldUsageCount,
} from '../../helpers/clientUsage/redisHelpers';
import { OperationType } from '../../model/enums';
import { BreakingChangeService } from '../breakingChange';
import { addUsageToChange, getDateRangeLimits } from './utils';

export class FieldChange implements BreakingChangeService {
	private types = [
		ChangeType.FieldRemoved,
		ChangeType.FieldTypeChanged,
		ChangeType.InputFieldTypeChanged,
		ChangeType.InputFieldRemoved,
	];

	validate(change: Change): boolean {
		if (change.type === ChangeType.FieldArgumentRemoved) {
			throw new Error(`Change type ${change.type} not managed yet`);
		}
		return this.types.includes(change.type);
	}

	async validateUsage(change: Change, usageDays = 30, minUsages = 0) {
		const split = change.path.split('.');
		const typeName = split[split.length - 2];
		const fieldName = split[split.length - 1];
		const { endDate, startDate } = getDateRangeLimits(usageDays);
		let usageCount: number;

		// ex: Query.homepageB2cBrands
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
			// Brand.siuyghdfgiysdgf => working
			// Query.homepageB2cBrands.platform => not working, argument considered as field
			const fieldRepo = FieldTransactionRepository.getInstance();
			const typeRepo = TypeTransactionalRepository.getInstance();

			const type = await typeRepo.getTypeByName(typeName);

			const field = await fieldRepo.getFieldByNameAndParent(
				fieldName,
				type.id
			);

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
