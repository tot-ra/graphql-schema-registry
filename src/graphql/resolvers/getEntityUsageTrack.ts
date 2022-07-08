import {
	EntityUsageResponse,
	Executions,
	ExecutionsDAO,
} from '../../model/client_usage';
import { KeyHandler } from '../../redis/key_handler';
import { RedisRepository } from '../../redis/redis';
import { parseInputDate } from '../utils';

export default async function getEntityUsageTrack(
	_parent,
	{ id, startDate, endDate }
): Promise<EntityUsageResponse> {
	const redisRepo = RedisRepository.getInstance();
	const keyHandler = new KeyHandler();

	const operations = await redisRepo.getOperationsByUsage(id, 'entity');
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

	const result: EntityUsageResponse = [];
	const fields: Map<number, Executions> = new Map();
	operations.forEach((operation, key) => {
		const { clientId, hash } = keyHandler.parseOperationKey(key);
		const executions = resultExecutions.find(
			(e) => e.hash === hash && clientId === e.clientId
		);
		const fieldIds = [];
		operation.operations.forEach((o) => {
			o.entities.forEach((e) => {
				e.fields.forEach((fieldId) => {
					if (!fieldIds.includes(fieldId)) {
						if (fields.has(fieldId)) {
							fields.set(
								fieldId,
								sumExecutions(fields.get(fieldId), executions)
							);
						} else {
							fields.set(fieldId, executions);
						}
						fieldIds.push(fieldId);
					}
				});
			});
		});
	});
	fields.forEach((executions, fieldId) => {
		result.push({
			id: fieldId,
			executions,
		});
	});
	return result;
}

function sumExecutions(a: Executions, b: Executions): Executions {
	return {
		error: a.error + b.error,
		success: a.success + b.success,
		total: a.total + b.total,
	};
}
