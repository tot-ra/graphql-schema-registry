import { gql } from '@apollo/client/core';
import {
	IContextualizedStats,
	ITrace,
	ITracesAndStats,
} from 'apollo-reporting-protobuf';
import {
	FieldNode,
	FragmentDefinitionNode,
	FragmentSpreadNode,
	InlineFragmentNode,
	Kind,
	OperationDefinitionNode,
	SelectionNode,
} from 'graphql';
import { ClientPayload } from '../../model/client';
import { UsageStats } from '../../model/usage_counter';

export interface ParsedOperationSdl {
	fragmentDefinitionNodes: FragmentDefinitionNode[];
	operationDefinitionNode: OperationDefinitionNode;
	rootFieldNodes: FieldNode[];
}

export function getChildFieldNodes(
	fragmentDefinitionNodes: FragmentDefinitionNode[],
	parentNode:
		| FieldNode
		| FragmentDefinitionNode
		| InlineFragmentNode
		| OperationDefinitionNode
): FieldNode[] {
	return (
		parentNode.selectionSet?.selections
			.map((selectionNode) =>
				selectionNode.kind === Kind.FRAGMENT_SPREAD
					? getFragmentSelections(
							fragmentDefinitionNodes,
							selectionNode
					  )
					: selectionNode
			)
			.flat()
			.filter(isNonMetaField) ?? []
	);
}

export async function getOperationClients(
	usageData: ITracesAndStats
): Promise<ClientPayload[]> {
	let clients = [];
	if ('statsWithContext' in usageData) {
		clients = (usageData.statsWithContext as IContextualizedStats[]).map(
			({ context }) => {
				return {
					name: context.clientName,
					version: context.clientVersion,
				};
			}
		);
	} else {
		const existingClients: string[] = [];
		usageData.trace
			.filter((trace) => !(trace instanceof Uint8Array))
			.forEach((trace: ITrace) => {
				const { clientName, clientVersion } = trace;
				const key = `${clientName}__${clientVersion}`;
				if (!existingClients.includes(key)) {
					clients.push({
						name: clientName,
						version: clientVersion,
					});
					existingClients.push(key);
				}
			});
	}
	return clients;
}

export function getOperationClientStats(
	client: ClientPayload,
	usageData: ITracesAndStats
): UsageStats {
	const traces = (usageData.trace?.filter(
		(trace) =>
			!(trace instanceof Uint8Array) &&
			trace.clientName === client.name &&
			trace.clientVersion === client.version
	) ?? []) as ITrace[];

	const statsWithContext = ((
		usageData.statsWithContext as IContextualizedStats[] | undefined
	)?.filter(
		(stats) =>
			stats?.context?.clientName === client.name &&
			stats?.context?.clientVersion === client.version
	) ?? []) as IContextualizedStats[];

	const queryClientStats: UsageStats = {
		error: 0,
		success: 0,
	};

	traces.forEach((trace) => {
		if ('error' in trace.root) {
			queryClientStats.error += 1;
		} else {
			queryClientStats.success += 1;
		}
	});

	statsWithContext.forEach((stats) => {
		const requestCount = stats.queryLatencyStats?.requestCount;
		const requestsWithErrorsCount =
			stats.queryLatencyStats?.rootErrorStats?.requestsWithErrorsCount;

		if (
			requestsWithErrorsCount !== undefined &&
			requestCount !== undefined
		) {
			queryClientStats.error += Number(requestsWithErrorsCount);
			queryClientStats.success +=
				Number(requestCount) - Number(requestsWithErrorsCount);
		}
	});

	return queryClientStats;
}

export function isNonMetaField(
	selectionNode: SelectionNode
): selectionNode is FieldNode {
	return (
		selectionNode.kind === Kind.FIELD &&
		!selectionNode.name.value.startsWith('__')
	);
}

export function parseOperationSdl(operationSdl: string): ParsedOperationSdl {
	const { definitions } = gql`
		${operationSdl}
	`;
	const operationDefinitionNode = definitions.find(
		({ kind }) => kind === 'OperationDefinition'
	) as OperationDefinitionNode | undefined;

	if (operationDefinitionNode === undefined) {
		throw new Error('No operation found in query SDL.');
	}

	const fragmentDefinitionNodes = definitions.filter(
		({ kind }) => kind === 'FragmentDefinition'
	) as FragmentDefinitionNode[];

	const rootFieldNodes = getChildFieldNodes(
		fragmentDefinitionNodes,
		operationDefinitionNode
	);

	return { fragmentDefinitionNodes, operationDefinitionNode, rootFieldNodes };
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
