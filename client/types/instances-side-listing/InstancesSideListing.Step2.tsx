import { useQuery } from '@apollo/client';
import styled from 'styled-components';
import { ListContainer } from '../../components/List';
import useMinimumTime from '../../shared/useMinimumTime';
import {
	TypeSideInstancesOutput,
	TypeSideInstancesVars,
	TYPE_SIDE_INSTANCES,
} from '../../utils/queries';
import { InstancesSideListingBody } from './InstancesSideListing.Body';
import { InstancesSideListingHeader } from './InstancesSideListing.Header';
import { InstancesSideListingSkeleton } from './InstancesSideListing.Skeleton';

const InstancesSideListingContainer = styled(ListContainer)`
	display: grid;
	grid-template-rows: auto 1fr;
`;

type InstancesSideListingStep2Props = {
	typeName: string;
	instanceId: string;
	count: number;
};

export const InstancesSideListingStep2 = ({
	count,
	typeName,
	instanceId,
}: InstancesSideListingStep2Props) => {
	const { loading, data, error } = useQuery<
		TypeSideInstancesOutput,
		TypeSideInstancesVars
	>(TYPE_SIDE_INSTANCES, {
		variables: {
			type: typeName,
			limit: count,
		},
	});

	const effectiveLoading = useMinimumTime(loading);

	if (effectiveLoading) {
		return <InstancesSideListingSkeleton />;
	}

	if (error) {
		return <ListContainer>Something wrong happened :(</ListContainer>;
	}

	const {
		listTypeInstances: { items },
	} = data;

	return (
		<InstancesSideListingContainer as="aside">
			<InstancesSideListingHeader typeName={typeName} counting={count} />
			<InstancesSideListingBody
				items={items}
				typeName={typeName}
				instanceId={instanceId}
			/>
		</InstancesSideListingContainer>
	);
};
