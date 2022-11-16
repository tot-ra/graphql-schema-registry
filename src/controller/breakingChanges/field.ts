import { Change, ChangeType } from '@graphql-inspector/core';
import { RedisRepository } from '../../redis/redis';
import { OperationType } from '../../model/enums';
import { OperationTransactionalRepository } from '../../database/schemaBreakdown/operations';
import { FieldTransactionRepository } from '../../database/schemaBreakdown/field';
import { TypeTransactionalRepository } from '../../database/schemaBreakdown/type';
import { getCustomChanges, validateBreakingChange } from './utils';
import { BreakingChangeService } from '../breakingChange';

export class FieldChange implements BreakingChangeService {
	private types = [
		ChangeType.FieldRemoved,
		ChangeType.FieldArgumentRemoved,
		ChangeType.FieldTypeChanged,
		ChangeType.InputFieldTypeChanged,
		ChangeType.InputFieldRemoved,
	];

	validate(change: Change) {
		return validateBreakingChange(this.types, change);
	}

	async validateUsage(change: Change, usage_days = 30, min_usages = 0) {
		const redisRepo = RedisRepository.getInstance();

		const split = change.path.split('.');
		const typeName = split[split.length - 2];
		const fieldName = split[split.length - 1];

		let operations;
		if (
			typeName.toLowerCase() === OperationType.QUERY ||
			typeName.toLowerCase() === OperationType.MUTATION
		) {
			const operationRepo =
				OperationTransactionalRepository.getInstance();

			const operation = await operationRepo.getOperationByName(fieldName);
			operations = await redisRepo.getOperationsByUsage(
				operation.id,
				'operation'
			);
		} else {
			const fieldRepo = FieldTransactionRepository.getInstance();
			const typeRepo = TypeTransactionalRepository.getInstance();

			const type = await typeRepo.getTypeByName(typeName);
			const field = await fieldRepo.getFieldByNameAndParent(
				fieldName,
				type.id
			);
			operations = await redisRepo.getOperationsByUsage(
				field.id,
				'field'
			);
		}

		return getCustomChanges(operations, change, usage_days, min_usages);
	}
}
