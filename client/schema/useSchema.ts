import { useCallback, useState } from 'react';
import { useQuery } from '@apollo/client';

import { Order, Service, Sort, SortField } from './types';
import { SERVICES_LIST } from '../utils/queries';

interface UseSchema {
	loading: boolean;
	setSort: (sort: SortField) => void;
	sort: Sort;
	services: Service[];
}

export const useSchema = (): UseSchema => {
	const [sort, setSort] = useState(() => {
		return {
			sortField: SortField.NAME,
			[SortField.NAME]: Order.ASC,
			[SortField.ADDEDD_TIME]: Order.ASC,
		};
	});

	const { loading, data } = useQuery<{ services: Service[] }>(SERVICES_LIST, {
		variables: {
			order: sort[sort.sortField],
			sortField: sort.sortField,
		},
	});

	const handleChange = useCallback(
		(field: SortField) => {
			setSort({
				...sort,
				sortField: field,
				[field]: sort[field] === Order.ASC ? Order.DESC : Order.ASC,
			});
		},
		[setSort, sort]
	);

	return {
		loading,
		setSort: handleChange,
		sort,
		services: data?.services || [],
	};
};
