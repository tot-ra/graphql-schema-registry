import { OperationTransactionalRepository } from '../../database/schemaBreakdown/operations';
import { Client } from '../../model/client';
import { UsageStats } from '../../model/usage_counter';
import { createRootFieldKey } from '../../helpers/clientUsage/keyHelpers';
import redisWrapper from '../../redis';
import { type ParsedOperationSdl } from './utils';

const REDIS_ENTRIES_TTL_SECONDS = 30 * 24 * 60 * 60;

export async function registerRootFieldsUsage(
	{ operationDefinitionNode, rootFieldNodes }: ParsedOperationSdl,
	registeredClient: Client,
	operationClientStats: UsageStats
): Promise<void> {
	const operationRepository = OperationTransactionalRepository.getInstance();

	const operationName =
		operationDefinitionNode.name?.value || 'no-operation-name';

	await Promise.all(
		rootFieldNodes.map(async ({ name }) => {
			const registeredRootField =
				await operationRepository.getOperationByName(name.value);

			if (registeredRootField) {
				const { success, error } = operationClientStats;
				const redisPromises: Promise<void>[] = [];

				if (success > 0) {
					const redisSuccessKey = createRootFieldKey(
						'success',
						registeredRootField.id,
						registeredClient.id,
						operationName
					);

					redisPromises.push(
						redisWrapper.incrOrSet(
							redisSuccessKey,
							success,
							REDIS_ENTRIES_TTL_SECONDS
						)
					);
				}
				if (error > 0) {
					const redisErrorKey = createRootFieldKey(
						'error',
						registeredRootField.id,
						registeredClient.id,
						operationName
					);

					redisPromises.push(
						redisWrapper.incrOrSet(
							redisErrorKey,
							error,
							REDIS_ENTRIES_TTL_SECONDS
						)
					);
				}
				await Promise.all(redisPromises);
			}
		})
	);
}
