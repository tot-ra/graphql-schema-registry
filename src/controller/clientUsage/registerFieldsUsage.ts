import { FieldNode, FragmentDefinitionNode, Kind } from 'graphql';
import { FieldTransactionRepository } from '../../database/schemaBreakdown/field';
import { OperationParamsTransactionalRepository } from '../../database/schemaBreakdown/operation_params';
import { OperationTransactionalRepository } from '../../database/schemaBreakdown/operations';
import { Client } from '../../model/client';
import { UsageStats } from '../../model/usage_counter';
import { createFieldKey } from '../../helpers/clientUsage/keyHelpers';
import redisWrapper from '../../redis';
import {
	getChildFieldNodes,
	getFragmentSelections,
	isNonMetaField,
	type ParsedOperationSdl,
} from './utils';
import TTLCache from '@isaacs/ttlcache';
import { createHash } from 'crypto';

const TWO_HOURS = 2 * 3600 * 1000;

const cache = new TTLCache({ max: 500, ttl: TWO_HOURS });

const REDIS_ENTRIES_TTL_SECONDS = 30 * 24 * 60 * 60;

type PartialNodeArray = { fieldId: number; typeId: number }[];

async function getAllFieldsInvolved(
	{ fragmentDefinitionNodes, operationSdl }: ParsedOperationSdl,
	rootFieldNode: FieldNode,
	operationParamRepository: OperationParamsTransactionalRepository,
	operationRepository: OperationTransactionalRepository
): Promise<PartialNodeArray> {
	const hash =
		createHash('md5').update(operationSdl).digest('hex') +
		rootFieldNode.name.value;

	const cachedSelections = cache.get(hash);
	if (cachedSelections) {
		return cachedSelections as PartialNodeArray;
	}

	const { id: rootFieldId } = await operationRepository.getOperationByName(
		rootFieldNode.name.value
	);

	const { type_id } =
		await operationParamRepository.getOperationParamOutputByParent(
			rootFieldId
		);

	const typeFieldPairs = await getTypeFieldPairsInDepth(
		getChildFieldNodes(fragmentDefinitionNodes, rootFieldNode),
		type_id,
		fragmentDefinitionNodes
	);

	cache.set(hash, typeFieldPairs);

	return typeFieldPairs;
}

export async function registerFieldsUsage(
	parseOperationSdl: ParsedOperationSdl,
	registeredClient: Client,
	operationClientStats: UsageStats
): Promise<void> {
	const { rootFieldNodes } = parseOperationSdl;
	const operationParamRepository =
		OperationParamsTransactionalRepository.getInstance();
	const operationRepository = OperationTransactionalRepository.getInstance();

	await Promise.all(
		rootFieldNodes.map(async (rootFieldNode) => {
			const typeFieldPairs = await getAllFieldsInvolved(
				parseOperationSdl,
				rootFieldNode,
				operationParamRepository,
				operationRepository
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
	parentTypeId: number,
	fragmentDefinitionNodes: FragmentDefinitionNode[]
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
				const selections = selectionSet.selections
					.map((selectionNode) =>
						selectionNode.kind === Kind.FRAGMENT_SPREAD
							? getFragmentSelections(
									fragmentDefinitionNodes,
									selectionNode
							  )
							: selectionNode
					)
					.flat()
					.filter(isNonMetaField);
				typeFieldPairs.push(
					...(await getTypeFieldPairsInDepth(
						selections,
						registeredField.children_type_id,
						fragmentDefinitionNodes
					))
				);
			}
		})
	);
	return typeFieldPairs;
}
