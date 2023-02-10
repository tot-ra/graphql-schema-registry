import { useQuery } from '@apollo/client';
import useMinimumTime from '../../shared/useMinimumTime';
import useCommonParams from '../../shared/useCommonParams';
import {
	type FieldClient,
	type TypeInstanceObjectStatsOutput,
	type TypeInstanceObjectStatsVars,
	TYPE_INSTANCE_OBJECT_STATS,
	type UsageStats,
} from '../../utils/queries';
import { MainViewContainer } from '../../components/MainViewContainer';
import { useDateRangeSelector } from '../../components/DateRangeSelector.Context';
import { ErrorRetry } from '../../components/ErrorRetry';
import { InstanceStatsListingSkeleton } from './common/InstanceStatsListing.Skeleton';
import { InstanceStatsListing } from './common/InstanceStatsListing';
import {
	InstanceStatsItem,
	InstanceStatsTable,
} from './common/InstanceStatsTable';
import { InstanceStatsTableSkeleton } from './common/InstanceStatsTable.Skeleton';
import { Argument } from '../instance-description/Argument';
import { InstanceStatsTableFieldStats } from './common/InstanceStatsTable.FieldStats';

type ObjectItem = InstanceStatsItem & {
	clients: FieldClient[];
};

export const InstanceStatsObject = () => {
	const { instanceId = 0 } = useCommonParams();
	const {
		range: { from, to },
	} = useDateRangeSelector();

	const { loading, error, data, refetch } = useQuery<
		TypeInstanceObjectStatsOutput,
		TypeInstanceObjectStatsVars
	>(TYPE_INSTANCE_OBJECT_STATS, {
		variables: {
			objectId: instanceId,
			startDate: from.toISOString(),
			endDate: to.toISOString(),
		},
	});

	const effectiveLoading = useMinimumTime(loading);

	if (effectiveLoading) {
		return (
			<InstanceStatsListingSkeleton>
				<InstanceStatsTableSkeleton hideTitle rows={9} />
			</InstanceStatsListingSkeleton>
		);
	}

	if (error || !data) {
		return <ErrorRetry onRetry={refetch} />;
	}

	const { getFieldsUsageStats: fields, getTypeInstance } = data;

	return (
		<MainViewContainer>
			<InstanceStatsListing {...getTypeInstance}>
				<InstanceStatsTable
					details={({ clients }: ObjectItem) => (
						<InstanceStatsTableFieldStats clients={clients} />
					)}
					headerLabel="Field"
					items={
						getTypeInstance.fields?.map((field) => {
							const clients =
								fields.find(
									({ fieldId }) => fieldId === field.id
								)?.clients ?? [];

							return {
								id: field.id,
								clients,
								name: field.key,
								label: (
									<Argument
										name={field.key}
										type={{
											id: field.parent.id,
											kind: field.parent.type,
											name: field.parent.name,
										}}
										isArray={field.isArray}
										isArrayNullable={field.isArrayNullable}
										isNullable={field.isNullable}
									/>
								),
								usageStats: mergeUsageStats(
									clients
										.map((client) =>
											client.clientVersions.map(
												(clientVersion) =>
													clientVersion.usageStats
											)
										)
										.flat()
								),
							};
						}) ?? []
					}
				/>
			</InstanceStatsListing>
		</MainViewContainer>
	);
};

function mergeUsageStats(usageStatsList: UsageStats[]): UsageStats {
	const usageStats: UsageStats = {
		error: 0,
		success: 0,
	};

	usageStatsList.forEach(({ error, success }) => {
		usageStats.error += error;
		usageStats.success += success;
	});
	return usageStats;
}
