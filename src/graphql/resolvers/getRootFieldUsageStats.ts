import { ClientRepository } from '../../database/client';
import { getAndParseRootFieldRedisEntries } from '../../helpers/clientUsage/redisHelpers';
import { RootFieldUsageStats } from '../../model/client_usage';
import { UsageStats } from '../../model/usage_counter';
import { deduplicate } from '../utils';

export interface RootFieldUsageStatsInputs {
	rootFieldId: number;
	startDate: string;
	endDate: string;
}

export default async function getRootFieldUsageStats(
	_parent,
	{ rootFieldId, startDate, endDate }: RootFieldUsageStatsInputs
): Promise<RootFieldUsageStats> {
	const clientRepos = ClientRepository.getInstance();
	const parsedRootFieldEntries = await getAndParseRootFieldRedisEntries(
		rootFieldId,
		new Date(startDate),
		new Date(endDate)
	);

	const clientIds = deduplicate(
		parsedRootFieldEntries.map(({ clientId }) => clientId)
	);
	const clients = (await clientRepos.getClientsByIds(clientIds)).sort(
		(a, b) => a.name.localeCompare(b.name)
	);

	return clients
		.map(({ name: clientName, versions }) => ({
			clientName,
			clientVersions: versions.map(
				({ id: clientId, tag: clientVersion }) => {
					const usageStatsByOperationName: Record<
						string,
						UsageStats
					> = {};

					parsedRootFieldEntries
						.filter((entry) => entry.clientId === clientId)
						.forEach(({ operationName, type, usageCount }) => {
							if (
								usageStatsByOperationName[operationName] ===
								undefined
							) {
								usageStatsByOperationName[operationName] = {
									error: 0,
									success: 0,
								};
							}
							const operationStats =
								usageStatsByOperationName[operationName];

							if (type === 'success') {
								operationStats.success += usageCount;
							} else {
								operationStats.error += usageCount;
							}
						});

					return {
						clientVersion,
						usageStatsByOperationName: Object.entries(
							usageStatsByOperationName
						).map(([operationName, usageStats]) => ({
							operationName,
							usageStats,
						})),
					};
				}
			),
		}))
		.filter((client) =>
			client.clientVersions.some((version) =>
				version.usageStatsByOperationName.some(
					({ usageStats }) =>
						usageStats.error > 0 || usageStats.success > 0
				)
			)
		);
}
