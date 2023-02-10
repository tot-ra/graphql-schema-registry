import { FieldNode } from 'graphql';
import { FieldTransactionRepository } from '../../database/schemaBreakdown/field';
import { OperationParamsTransactionalRepository } from '../../database/schemaBreakdown/operation_params';
import { OperationTransactionalRepository } from '../../database/schemaBreakdown/operations';
import { Client } from '../../model/client';
import { UsageStats } from '../../model/usage_counter';
import { createFieldKey } from '../../helpers/clientUsage/keyHelpers';
import redisWrapper from '../../redis';
import {
	getChildFieldNodes,
	isNonMetaField,
	type ParsedOperationSdl,
} from './utils';

const REDIS_ENTRIES_TTL_SECONDS = 30 * 24 * 60 * 60;

export async function registerFieldsUsage(
	{ fragmentDefinitionNodes, rootFieldNodes }: ParsedOperationSdl,
	registeredClient: Client,
	operationClientStats: UsageStats
): Promise<void> {
	const operationParamRepository =
		OperationParamsTransactionalRepository.getInstance();
	const operationRepository = OperationTransactionalRepository.getInstance();

	await Promise.all(
		rootFieldNodes.map(async (rootFieldNode) => {
			const { id: rootFieldId } =
				await operationRepository.getOperationByName(
					rootFieldNode.name.value
				);

			const { type_id } =
				await operationParamRepository.getOperationParamOutputByParent(
					rootFieldId
				);

			const typeFieldPairs = await getTypeFieldPairsInDepth(
				getChildFieldNodes(fragmentDefinitionNodes, rootFieldNode),
				type_id
			);

			await Promise.all(
				typeFieldPairs.map(async ({ fieldId, typeId }) => {
					const { success, error } = operationClientStats;
					const redisPromises: Promise<void>[] = [];

					if (success > 0) {
						const redisSuccessKey = createFieldKey(
							'success',
							typeId,
							fieldId,
							registeredClient.id
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
						const redisErrorKey = createFieldKey(
							'error',
							typeId,
							fieldId,
							registeredClient.id
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
				})
			);
		})
	);
}

async function getTypeFieldPairsInDepth(
	fields: FieldNode[],
	parentTypeId: number
): Promise<{ fieldId: number; typeId: number }[]> {
	const fieldRepository = FieldTransactionRepository.getInstance();
	const typeFieldPairs: { fieldId: number; typeId: number }[] = [];

	await Promise.all(
		fields.map(async ({ name, selectionSet }) => {
			const registeredField =
				await fieldRepository.getFieldByNameAndParent(
					name.value,
					parentTypeId
				);

			if (!registeredField) {
				return;
			}

			if (
				!typeFieldPairs.some(
					({ fieldId }) => fieldId === registeredField.id
				)
			) {
				typeFieldPairs.push({
					fieldId: registeredField.id,
					typeId: parentTypeId,
				});
			}

			if (selectionSet) {
				typeFieldPairs.push(
					...(await getTypeFieldPairsInDepth(
						selectionSet.selections.filter(isNonMetaField),
						registeredField.children_type_id
					))
				);
			}
		})
	);
	return typeFieldPairs;
}
