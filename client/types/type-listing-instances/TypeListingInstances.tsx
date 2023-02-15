import { useCallback, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useHistory } from 'react-router-dom';

import { DEFAULT_OFFSET, usePaginationValues } from '../../shared/pagination';
import useMinimumTime from '../../shared/useMinimumTime';
import {
	TypeInstancesOutput,
	TypeInstancesVars,
	TYPE_INSTANCES,
} from '../../utils/queries';
import { InstancesListing } from './InstancesListing';
import { TypeListingInstancesSkeleton } from './TypeListingInstances.Skeleton';
import { ErrorRetry } from '../../components/ErrorRetry';
import useCommonParams from '../../shared/useCommonParams';
import { MainViewContainer } from '../../components/MainViewContainer';
import { Order } from '../../schema/types';

export const TypeListingInstances = () => {
	const history = useHistory();
	const [pagination, createPaginationSearchParams] = usePaginationValues();
	const { typeName } = useCommonParams();
	const [order, setOrder] = useState<Order>(Order.ASC);

	const { loading, data, error, refetch } = useQuery<
		TypeInstancesOutput,
		TypeInstancesVars
	>(TYPE_INSTANCES, {
		variables: {
			type: typeName,
			limit: pagination.limit,
			offset: pagination.offset,
			order,
		},
	});

	const handleChangePage = useCallback(
		(newPage: number) => {
			history.push({
				search: createPaginationSearchParams({
					offset: newPage * pagination.limit,
				}),
			});
		},
		[createPaginationSearchParams, history, pagination.limit]
	);

	const handleChangeRowsPerPage = useCallback(
		(rowsPerPage: number) => {
			history.push({
				search: createPaginationSearchParams({
					limit: rowsPerPage,
					offset: DEFAULT_OFFSET,
				}),
			});
		},
		[createPaginationSearchParams, history]
	);

	const handleOrderChange = useCallback(() => {
		setOrder((prev) => (prev === Order.ASC ? Order.DESC : Order.ASC));
	}, [setOrder]);

	const efectiveLoading = useMinimumTime(loading);

	if (efectiveLoading) {
		return (
			<MainViewContainer>
				<TypeListingInstancesSkeleton />
			</MainViewContainer>
		);
	}

	if (error) {
		return <ErrorRetry onRetry={refetch} />;
	}

	const {
		listTypeInstances: { items },
	} = data;

	return (
		<MainViewContainer>
			<InstancesListing
				typeName={typeName}
				items={items}
				pagination={data?.listTypeInstances?.pagination}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				order={order.toLowerCase() as 'asc' | 'desc'}
				onOrderChange={handleOrderChange}
			/>
		</MainViewContainer>
	);
};
