import { ClientOperationsDTO, ExecutionsDAO } from '../../model/client_usage';
import { KeyHandler } from '../../redis/key_handler';
import { RedisRepository } from '../../redis/redis';
import { getTimestamp } from '../../redis/utils';
import { OperationChange } from './operation';
import { EnumChange } from './enum';
import { FieldChange } from './field';
import { TypeChange } from './type';
import { Change } from '@graphql-inspector/core';
import { CustomChange } from '../breakingChange';
import { ArgumentChange } from './argument';
import { InterfaceChange } from './interface';
import { parseInputDate } from '../../graphql/utils';

type BreakingChangeType =
	| OperationChange
	| EnumChange
	| FieldChange
	| TypeChange
	| ArgumentChange
	| InterfaceChange;

export const getBreakingChangesTypes = (): BreakingChangeType[] => {
	return [
		new FieldChange(),
		new TypeChange(),
		new OperationChange(),
		new EnumChange(),
		new ArgumentChange(),
		new InterfaceChange(),
	];
};

export const checkUsage = async (
	operations: ClientOperationsDTO,
	usage_days: number
): Promise<number> => {
	const redisRepo = RedisRepository.getInstance();
	const keyHandler = new KeyHandler();

	const now = new Date(getTimestamp() * 1000);
	const startDate = new Date(
		getTimestamp(new Date().setDate(now.getDate() - usage_days)) * 1000
	).toString();
	const endDate = now.toString();

	const executions: Promise<ExecutionsDAO>[] = [];
	operations.forEach((_o, key) => {
		const { hash, clientId } = keyHandler.parseOperationKey(key);
		executions.push(
			redisRepo.getExecutionsFromOperation({
				clientId,
				hash,
				startSeconds: parseInputDate(startDate),
				endSeconds: parseInputDate(endDate),
			})
		);
	});
	const resultExecutions = await Promise.all(executions);
	return resultExecutions.reduce((acc, cur) => {
		return (acc += cur.total);
	}, 0);
};

export const validateBreakingChange = (
	types: string[],
	change: Change
): boolean => {
	return types.includes(change.type);
};

export const getCustomChanges = async (
	operations: ClientOperationsDTO,
	change: Change,
	usage_days: number,
	min_usages: number
): Promise<CustomChange> => {
	if (!operations) {
		return {
			...change,
			isBreakingChange: false,
			totalUsages: 0,
		};
	}
	const totalUsages = await checkUsage(operations, usage_days);
	return {
		...change,
		isBreakingChange: totalUsages >= min_usages && totalUsages !== 0,
		totalUsages,
	};
};
