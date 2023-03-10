import { ClientRepository } from '../../database/client';
import {
	getAndParseFieldRedisEntries,
	ParsedFieldRedisEntry,
} from '../../helpers/clientUsage/redisHelpers';
import { FieldsUsageStats } from '../../model/client_usage';
import { UsageStats } from '../../model/usage_counter';
import { deduplicate } from '../utils';

export interface FieldsUsageStatsInputs {
	parentTypeId: number;
	startDate: string;
	endDate: string;
}

export default async function getFieldsUsageStats(
	_parent,
	{ parentTypeId, startDate, endDate }: FieldsUsageStatsInputs
): Promise<FieldsUsageStats> {
	const clientRepos = ClientRepository.getInstance();
	const parsedFieldEntriesMap = new Map<number, ParsedFieldRedisEntry[]>();
	const parsedFieldEntries = await getAndParseFieldRedisEntries(
		parentTypeId,
		new Date(startDate),
		new Date(endDate)
	);

	parsedFieldEntries.forEach((parsedFieldEntry) => {
		const { fieldId } = parsedFieldEntry;

		if (!parsedFieldEntriesMap.has(fieldId)) {
			parsedFieldEntriesMap.set(fieldId, []);
		}
		parsedFieldEntriesMap.get(fieldId).push(parsedFieldEntry);
	});

	const clientIds = deduplicate(
		parsedFieldEntries.map(({ clientId }) => clientId)
	);
	const clients = (await clientRepos.getClientsByIds(clientIds)).sort(
		(a, b) => a.name.localeCompare(b.name)
	);

	return [...parsedFieldEntriesMap.entries()].map(
		([fieldId, parsedFieldEntries]) => ({
			fieldId,
			clients: clients
				.map(({ name: clientName, versions }) => ({
					clientName,
					clientVersions: versions.map(
						({ id: clientId, tag: clientVersion }) => {
							const usageStats: UsageStats = {
								error: 0,
								success: 0,
							};

							parsedFieldEntries
								.filter(
									(entry) =>
										entry.clientId === clientId &&
										entry.usageCount > 0
								)
								.forEach(({ type, usageCount }) => {
									if (type === 'success') {
										usageStats.success += usageCount;
									} else {
										usageStats.error += usageCount;
									}
								});

							return { clientVersion, usageStats };
						}
					),
				}))
				.filter((client) =>
					client.clientVersions.some(
						({ usageStats }) =>
							usageStats.error > 0 || usageStats.success > 0
					)
				),
		})
	);
}
