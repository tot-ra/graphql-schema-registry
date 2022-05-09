import { useQuery } from '@apollo/client';
import { Box } from '@material-ui/core';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import SpinnerCenter from '../../components/SpinnerCenter';
import { usePaginationValues } from '../../shared/pagination';
import {
	TypeInstancesOutput,
	TypeInstancesVars,
	TYPE_INSTANCES,
} from '../../utils/queries';

const TypeDescriptionContainer = styled.section`
	width: 100%;
	height: 100%;
	overflow: auto;
	padding: 2rem;
`;

export const TypeListingInstances = () => {
	const { limit, offset } = usePaginationValues();
	const { typeName } = useParams<{ typeName: string }>();

	const { loading, data, error } = useQuery<
		TypeInstancesOutput,
		TypeInstancesVars
	>(TYPE_INSTANCES, {
		variables: {
			type: typeName,
			limit,
			offset,
		},
	});

	if (loading) {
		return <SpinnerCenter />;
	}

	if (error) {
		<TypeDescriptionContainer>
			<Box component="span">Something wrong happened :(</Box>
		</TypeDescriptionContainer>;
	}

	return (
		<TypeDescriptionContainer>
			<Box component="span">{typeName}</Box>
		</TypeDescriptionContainer>
	);
};
