import { gql } from '@apollo/client/core';
import { FragmentSpreadNode } from 'graphql/language/ast';
import {
	FieldNode,
	FragmentDefinitionNode,
	Kind,
	OperationDefinitionNode,
	SelectionNode,
} from 'graphql';
import { OperationTransactionalRepository } from '../../database/schemaBreakdown/operations';
import { Client } from '../../model/client';
import { UsageStats } from '../../model/usage_counter';
import redisWrapper from '../../redis';
import { createRootFieldKey } from '../../helpers/clientUsage/keyHelper';

const REDIS_ENTRIES_TTL_SECONDS = 30 * 24 * 60 * 60;

export async function registerRootFieldsUsage(
	operationSdl: string,
	registeredClient: Client,
	operationClientStats: UsageStats
): Promise<void> {
	const operationRepository = OperationTransactionalRepository.getInstance();
	const { definitions } = gql`
		${operationSdl}
	`;
	const operation = definitions.find(
		({ kind }) => kind === 'OperationDefinition'
	) as OperationDefinitionNode | undefined;

	if (operation === undefined) {
		throw new Error('No operation found in query SDL.');
	}

	const operationName = operation.name?.value || 'no-operation-name';

	const fragmentDefinitionNodes = definitions.filter(
		({ kind }) => kind === 'FragmentDefinition'
	) as FragmentDefinitionNode[];

	const rootFieldNodes = operation.selectionSet.selections
		.map((selectionNode) =>
			selectionNode.kind === Kind.FRAGMENT_SPREAD
				? getFragmentSelections(fragmentDefinitionNodes, selectionNode)
				: selectionNode
		)
		.flat()
		.filter(isNonMetaField) as FieldNode[];

	await Promise.all(
		rootFieldNodes.map(async ({ name }) => {
			const registeredRootField =
				await operationRepository.getOperationByName(name.value);

			if (registeredRootField) {
				const redisSuccessKey = createRootFieldKey(
					'success',
					registeredRootField.id,
					registeredClient.id,
					operationName
				);
				const redisErrorKey = createRootFieldKey(
					'error',
					registeredRootField.id,
					registeredClient.id,
					operationName
				);
				const { success, error } = operationClientStats;
				const redisPromises: Promise<void>[] = [];

				if (success > 0) {
					redisPromises.push(
						redisWrapper
							.exists(redisSuccessKey)
							.then((exists) =>
								exists
									? redisWrapper.incr(
											redisSuccessKey,
											success
									  )
									: redisWrapper.set(
											redisSuccessKey,
											success,
											REDIS_ENTRIES_TTL_SECONDS
									  )
							)
					);
				}
				if (error > 0) {
					redisPromises.push(
						redisWrapper
							.exists(redisErrorKey)
							.then((exists) =>
								exists
									? redisWrapper.incr(redisErrorKey, error)
									: redisWrapper.set(
											redisErrorKey,
											error,
											REDIS_ENTRIES_TTL_SECONDS
									  )
							)
					);
				}

				await Promise.all(redisPromises);
			}
		})
	);
}

function getFragmentSelections(
	fragmentDefinitionNodes: FragmentDefinitionNode[],
	fragmentSpreadNode: FragmentSpreadNode
): readonly SelectionNode[] {
	return (
		fragmentDefinitionNodes.find(
			(fragmentDefinitionNode) =>
				fragmentDefinitionNode.name.value ===
				fragmentSpreadNode.name.value
		)?.selectionSet.selections ?? []
	);
}

function isNonMetaField(selectionNode: SelectionNode): boolean {
	return (
		selectionNode.kind === Kind.FIELD &&
		!selectionNode.name.value.startsWith('__')
	);
}
