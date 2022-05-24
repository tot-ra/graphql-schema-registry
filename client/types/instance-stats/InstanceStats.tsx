import { useQuery } from '@apollo/client';
import useMinimumTime from '../../shared/useMinimumTime';
import useCommonParams from '../../shared/useCommonParams';
import {
	TypeInstanceStatsOutput,
	TypeInstanceStatsVars,
	TYPE_INSTANCE_STATS,
} from '../../utils/queries';
import { InstanceStatsListing } from './InstanceStatsListing';
import { Typography } from '@material-ui/core';
import { InstanceStatsListingSkeleton } from './InstanceStatsListing.Skeleton';
import { MainViewContainer } from '../../components/MainViewContainer';

const date = new Date();

export const InstanceStats = () => {
	const { typeName, instanceId } = useCommonParams();

	const { loading, error, data } = useQuery<
		TypeInstanceStatsOutput,
		TypeInstanceStatsVars
	>(TYPE_INSTANCE_STATS, {
		variables: {
			type: typeName,
			id: instanceId,
			startDate: date,
			endDate: date,
		},
	});

	const effectiveLoading = useMinimumTime(loading);

	if (effectiveLoading) {
		return <InstanceStatsListingSkeleton />;
	}

	if (error || !data) {
		return (
			<MainViewContainer>
				<Typography component="span">
					Something wrong happened :(
				</Typography>
			</MainViewContainer>
		);
	}

	const { getUsageTrack, getTypeInstance } = data;

	return (
		<MainViewContainer>
			<InstanceStatsListing items={getUsageTrack} {...getTypeInstance} />
		</MainViewContainer>
	);
};
