import { useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { DEFAULT_OFFSET, usePaginationValues } from '../../shared/pagination';
import useMinimumTime from '../../shared/useMinimumTime';
import {
	TypeInstancesOutput,
	TypeInstancesVars,
	TYPE_INSTANCES,
} from '../../utils/queries';
import { InstancesListing } from './InstancesListing';
import { TypeListingInstancesSkeleton } from './TypeListingInstances.Skeleton';

const TypeDescriptionContainer = styled.main`
	overflow: auto;
	padding: 2rem;
`;

export const TypeListingInstances = () => {
	const [pagination, setPagination] = usePaginationValues();
	const { typeName } = useParams<{ typeName: string }>();

	const { loading, data, error } = useQuery<
		TypeInstancesOutput,
		TypeInstancesVars
	>(TYPE_INSTANCES, {
		variables: {
			type: typeName,
			limit: pagination.limit,
			offset: pagination.offset,
		},
	});

	const handleChangePage = useCallback(
		(newPage: number) => {
			setPagination({
				limit: pagination.limit,
				offset: newPage * pagination.limit,
			});
		},
		[pagination.limit]
	);

	const handleChangeRowsPerPage = (rowsPerPage: number) => {
		setPagination({
			limit: rowsPerPage,
			offset: DEFAULT_OFFSET,
		});
	};

	const efectiveLoading = useMinimumTime(loading);

	if (efectiveLoading) {
		return (
			<TypeDescriptionContainer>
				<TypeListingInstancesSkeleton />
			</TypeDescriptionContainer>
		);
	}

	if (error) {
		return (
			<TypeDescriptionContainer>
				<Typography component="span">
					Something wrong happened :(
				</Typography>
			</TypeDescriptionContainer>
		);
	}

	const {
		listTypeInstances: { items },
	} = data;

	return (
		<TypeDescriptionContainer>
			<InstancesListing
				typeName={typeName}
				items={items}
				pagination={data?.listTypeInstances?.pagination}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
			/>
		</TypeDescriptionContainer>
	);
};
