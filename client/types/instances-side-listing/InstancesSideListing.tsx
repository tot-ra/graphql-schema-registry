import { useLazyQuery, useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ListContainer } from '../../components/List';
import useMinimumTime from '../../shared/useMinimumTime';
import {
	ListTypesOutput,
	LIST_TYPES,
	TypeSideInstancesOutput,
	TypeSideInstancesVars,
	TYPE_SIDE_INSTANCES,
} from '../../utils/queries';
import { InstanceSideListingHeader } from './InstanceSideListingHeader';
import { InstanceSideListingBody } from './InstanceSideListingBody';
import { InstancesSideListingSkeleton } from './InstancesSideListing.Skeleton';
import { useEffect } from 'react';

const InstancesSideListingContainer = styled(ListContainer)`
	display: grid;
	grid-template-rows: auto 1fr;
`;

export const InstancesSideListing = () => {
	const { typeName, instanceId } = useParams<{
		typeName: string;
		instanceId: string;
	}>();

	const { loading, data, error } = useQuery<ListTypesOutput>(LIST_TYPES);

	const counting =
		data?.listTypes.operations.find((entity) => entity.type === typeName)
			?.count ??
		data?.listTypes.entities.find((entity) => entity.type === typeName)
			?.count ??
		0;

	const [
		loadInstances,
		{
			loading: instancesLoading,
			data: instancesData,
			error: instancesError,
		},
	] = useLazyQuery<TypeSideInstancesOutput, TypeSideInstancesVars>(
		TYPE_SIDE_INSTANCES,
		{
			variables: {
				type: typeName,
				limit: counting,
			},
		}
	);

	useEffect(() => {
		if (data) {
			loadInstances();
		}
	}, [data, loadInstances]);

	const efectiveLoading = useMinimumTime(
		loading || instancesLoading || !instancesData
	);

	if (efectiveLoading) {
		return <InstancesSideListingSkeleton />;
	}

	if (error || instancesError) {
		return <ListContainer>Something wrong happened :(</ListContainer>;
	}

	const {
		listTypeInstances: { items },
	} = instancesData;

	return (
		<InstancesSideListingContainer as="aside">
			<InstanceSideListingHeader
				typeName={typeName}
				counting={counting}
			/>
			<InstanceSideListingBody
				items={items}
				typeName={typeName}
				instanceId={instanceId}
			/>
		</InstancesSideListingContainer>
	);
};
