import { useQuery } from '@apollo/client';
import useMinimumTime from '../../shared/useMinimumTime';
import useCommonParams from '../../shared/useCommonParams';
import {
	TypeInstanceObjectStatsOutput,
	TypeInstanceObjectStatsVars,
	TYPE_INSTANCE_OBJECT_STATS,
} from '../../utils/queries';
import { MainViewContainer } from '../../components/MainViewContainer';
import { useDateRangeSelector } from '../../components/DateRangeSelector.Context';
import { ErrorRetry } from '../../components/ErrorRetry';
import { InstanceStatsListingSkeleton } from './common/InstanceStatsListing.Skeleton';
import { InstanceStatsListing } from './common/InstanceStatsListing';
import { InstanceStatsTable } from './common/InstanceStatsTable';
import { InstanceStatsTableSkeleton } from './common/InstanceStatsTable.Skeleton';
import { Argument } from '../instance-description/Argument';

export const InstanceStatsEntity = () => {
	const { instanceId } = useCommonParams();
	const {
		range: { from, to },
	} = useDateRangeSelector();

	const { loading, error, data, refetch } = useQuery<
		TypeInstanceObjectStatsOutput,
		TypeInstanceObjectStatsVars
	>(TYPE_INSTANCE_OBJECT_STATS, {
		variables: {
			id: instanceId,
			startDate: from,
			endDate: to,
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

	const { getEntityUsageTrack: items, getTypeInstance } = data;

	return (
		<MainViewContainer>
			<InstanceStatsListing {...getTypeInstance}>
				<InstanceStatsTable
					headerLabel="Field"
					items={getTypeInstance.fields?.map((field) => ({
						id: field.key,
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
						href: `/types/object/${getTypeInstance.id}`,
						executions: items.find((item) => item.id === field.id)
							?.executions,
					}))}
				/>
			</InstanceStatsListing>
		</MainViewContainer>
	);
};
