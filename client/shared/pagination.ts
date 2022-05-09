import { useParams } from 'react-router-dom';

export type Pagination<Type = number> = {
	limit?: Type;
	offset?: Type;
};

export const usePaginationValues = (): Pagination => {
	const { limit, offset } = useParams<Pagination<string>>();

	return {
		limit: limit ? parseInt(limit, 10) : undefined,
		offset: offset ? parseInt(offset, 10) : undefined,
	};
};
