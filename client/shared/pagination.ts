import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const DEFAULT_LIMIT = 10;
export const DEFAULT_OFFSET = 1;

export function useQuery() {
	const { search } = useLocation();
	return useMemo(() => new URLSearchParams(search), [search]);
}

export type Pagination = {
	limit: number;
	offset: number;
};

export const usePaginationValues = (): [
	Pagination,
	React.Dispatch<React.SetStateAction<Pagination>>
] => {
	const query = useQuery();
	const limit = query.get('limit');
	const offset = query.get('offset');

	const [pagination, setPagination] = useState<Pagination>({
		limit: limit ? parseInt(limit, 10) : DEFAULT_LIMIT,
		offset: offset ? parseInt(offset, 10) : DEFAULT_OFFSET,
	});

	return [pagination, setPagination];
};
