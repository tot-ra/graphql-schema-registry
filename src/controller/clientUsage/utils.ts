import {
	IContextualizedStats,
	ITrace,
	ITracesAndStats,
} from 'apollo-reporting-protobuf';
import { ClientPayload } from '../../model/client';
import { UsageStats } from '../../model/usage_counter';

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
