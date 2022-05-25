import { useQuery } from '@apollo/client';
import useMinimumTime from '../../shared/useMinimumTime';
import useCommonParams from '../../shared/useCommonParams';
import {
	TypeInstanceStatsOutput,
	TypeInstanceStatsVars,
	TYPE_INSTANCE_STATS,
} from '../../utils/queries';
import { InstanceStatsListing } from './InstanceStatsListing';
import { InstanceStatsListingSkeleton } from './InstanceStatsListing.Skeleton';
import { MainViewContainer } from '../../components/MainViewContainer';
import { useDateRangeSelector } from '../../components/DateRangeSelector.Context';
import { ErrorRetry } from '../../components/ErrorRetry';

export const InstanceStats = () => {
	const { typeName, instanceId } = useCommonParams();
	const {
		range: { from, to },
	} = useDateRangeSelector();

	const { loading, error, data, refetch } = useQuery<
		TypeInstanceStatsOutput,
		TypeInstanceStatsVars
	>(TYPE_INSTANCE_STATS, {
		variables: {
			type: typeName,
			id: instanceId,
			startDate: from,
			endDate: to,
		},
	});

	const effectiveLoading = useMinimumTime(loading);

	if (effectiveLoading) {
		return <InstanceStatsListingSkeleton />;
	}

	if (error || !data) {
		return <ErrorRetry onRetry={refetch} />;
	}

	const { getUsageTrack, getTypeInstance } = data;

	return (
		<MainViewContainer>
			<InstanceStatsListing items={getUsageTrack} {...getTypeInstance} />
		</MainViewContainer>
	);
};
