import { ClientRepository } from '../../database/client';
import { parseRootFieldKey } from '../../helpers/clientUsage/keyHelper';
import { RootFieldUsageStats } from '../../model/client_usage';
import { UsageStats } from '../../model/usage_counter';
import { RedisRepository } from '../../redis/redis';
import { getTimestamp } from '../../redis/utils';

export default async function getRootFieldUsageStats(
	_parent,
	{ id, startDate, endDate }
): Promise<RootFieldUsageStats> {
	const redisRepos = RedisRepository.getInstance();
	const clientRepos = ClientRepository.getInstance();
	const startTimestamp = getTimestamp(startDate);
	const endTimestamp = getTimestamp(endDate);
	const rootFieldEntries = await redisRepos.getRootFieldRedisEntries(
		id,
		startTimestamp,
		endTimestamp
	);

	const clientIds = [
		...new Set(
			rootFieldEntries.map(
				([redisKey]) => parseRootFieldKey(redisKey).clientId
			)
		),
	];
	const clients = (await clientRepos.getClientsByIds(clientIds)).sort(
		(a, b) => a.name.localeCompare(b.name)
	);

	return clients
		.map(({ name, versions }) => {
			return {
				name,
				versions: versions.map(({ id, tag }) => {
					const usageStatsByOperationName: Record<
						string,
						UsageStats
					> = {};

					rootFieldEntries.forEach(([redisKey, rawCount]) => {
						const { clientId, operationName, timestamp, type } =
							parseRootFieldKey(redisKey);

						if (
							clientId === id &&
							timestamp >= startTimestamp &&
							timestamp <= endTimestamp
						) {
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
								operationStats.success += Number(rawCount);
							} else {
								operationStats.error += Number(rawCount);
							}
						}
					});

					return {
						usageStatsByOperationName: Object.entries(
							usageStatsByOperationName
						).map(([operationName, usageStats]) => ({
							operationName,
							usageStats,
						})),
						version: tag,
					};
				}),
			};
		})
		.filter((client) =>
			client.versions.some((version) =>
				version.usageStatsByOperationName.some(
					({ usageStats }) =>
						usageStats.error > 0 || usageStats.success > 0
				)
			)
		);
}
