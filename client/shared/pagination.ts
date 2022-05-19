import { useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const DEFAULT_LIMIT = 10;
export const DEFAULT_OFFSET = 0;

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
	(values: Partial<Pagination>) => string
] => {
	const query = useQuery();
	const limit = query.get('limit');
	const offset = query.get('offset');
	const [selectedLimit, setLimit] = useState(
		limit ? parseInt(limit, 10) : DEFAULT_LIMIT
	);

	const values = useMemo(
		() => ({
			limit: selectedLimit,
			offset: offset ? parseInt(offset, 10) : DEFAULT_OFFSET,
		}),
		[selectedLimit, offset]
	);

	const createSearchParams = useCallback(
		(params: Partial<Pagination>): string => {
			const searchParams = new URLSearchParams();
			const newLimit = params.limit ?? values.limit;
			searchParams.set('limit', `${newLimit}`);
			searchParams.set('offset', `${params.offset ?? values.offset}`);
			setLimit(newLimit);

			return searchParams.toString();
		},
		[values]
	);

	return [values, createSearchParams];
};
