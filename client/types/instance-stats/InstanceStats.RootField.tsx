import { useQuery } from '@apollo/client';
import styled from 'styled-components';

import useMinimumTime from '../../shared/useMinimumTime';
import useCommonParams from '../../shared/useCommonParams';
import {
	TYPE_INSTANCE_ROOT_FIELD_STATS,
	TypeInstanceRootFieldStatsOutput,
	TypeInstanceRootFieldStatsVars,
} from '../../utils/queries';
import { MainViewContainer } from '../../components/MainViewContainer';
import { useDateRangeSelector } from '../../components/DateRangeSelector.Context';
import { ErrorRetry } from '../../components/ErrorRetry';
import { InstanceStatsListingSkeleton } from './common/InstanceStatsListing.Skeleton';
import { InstanceStatsListing } from './common/InstanceStatsListing';
import { InstanceStatsClientSkeleton } from './operation/InstanceStatsClient.Skeleton';
import { InstanceStatsClient } from './operation/InstanceStatsClient';

const ClientsList = styled.ul`
	display: grid;
	row-gap: 2rem;
	padding: 0;
	margin: 0;
	list-style: none;
`;

export const InstanceStatsRootField = () => {
	const { typeName = '', instanceId = 0 } = useCommonParams();
	const {
		range: { from, to },
	} = useDateRangeSelector();

	const { loading, error, data, refetch } = useQuery<
		TypeInstanceRootFieldStatsOutput,
		TypeInstanceRootFieldStatsVars
	>(TYPE_INSTANCE_ROOT_FIELD_STATS, {
		variables: {
			rootFieldId: instanceId,
			type: typeName,
			startDate: from.toISOString(),
			endDate: to.toISOString(),
		},
	});

	const effectiveLoading = useMinimumTime(loading);

	if (effectiveLoading) {
		return (
			<InstanceStatsListingSkeleton>
				<InstanceStatsClientSkeleton amount={2} />
			</InstanceStatsListingSkeleton>
		);
	}

	if (error || !data) {
		return <ErrorRetry onRetry={refetch} />;
	}

	const { getRootFieldUsageStats: items, getTypeInstance } = data;

	return (
		<MainViewContainer>
			<InstanceStatsListing {...getTypeInstance}>
				{items.length === 0 && <span>No clients :(</span>}
				{items.length > 0 && (
					<ClientsList>
						{items.map(({ clientName, clientVersions }) => (
							<InstanceStatsClient
								key={clientName}
								clientName={clientName}
								clientVersions={clientVersions}
							/>
						))}
					</ClientsList>
				)}
			</InstanceStatsListing>
		</MainViewContainer>
	);
};
