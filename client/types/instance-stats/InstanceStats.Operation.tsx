import { useQuery } from '@apollo/client';
import styled from 'styled-components';

import useMinimumTime from '../../shared/useMinimumTime';
import useCommonParams from '../../shared/useCommonParams';
import {
	TypeInstanceOperationStatsOutput,
	TypeInstanceOperationStatsVars,
	TYPE_INSTANCE_OPERATION_STATS,
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

export const InstanceStatsOperation = () => {
	const { typeName = '', instanceId = 0 } = useCommonParams();
	const {
		range: { from, to },
	} = useDateRangeSelector();

	const { loading, error, data, refetch } = useQuery<
		TypeInstanceOperationStatsOutput,
		TypeInstanceOperationStatsVars
	>(TYPE_INSTANCE_OPERATION_STATS, {
		variables: {
			id: instanceId,
			type: typeName,
			startDate: from,
			endDate: to,
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

	const { getOperationUsageTrack: items, getTypeInstance } = data;

	return (
		<MainViewContainer>
			<InstanceStatsListing {...getTypeInstance}>
				{items.length === 0 && <span>No clients :(</span>}
				{items.length > 0 && (
					<ClientsList>
						{items.map(({ client }) => (
							<InstanceStatsClient
								key={client.name}
								client={client}
							/>
						))}
					</ClientsList>
				)}
			</InstanceStatsListing>
		</MainViewContainer>
	);
};
