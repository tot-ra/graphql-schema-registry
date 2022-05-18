export const isEnum = (value: String, targetEnum) =>
	Object.values(targetEnum).includes(value);

export interface Pagination {
	limit: number;
	page: number;
	totalPages: number;
}

export async function getPaginatedResult<T>(
	totalItems: number,
	limit: number,
	offset: number,
	result: (safeOffset) => T
) {
	let pagination = getPagination(limit, offset, totalItems);
	let safeOffset = offset;
	if (isOffsetOutbounds(pagination)) {
		pagination = { ...pagination, page: 1 };
		safeOffset = 0;
	}
	return {
		pagination,
		...(await result(safeOffset)),
	};
}

function getPagination(
	limit: number,
	offset: number,
	totalItems: number
): Pagination {
	const totalPages = Math.ceil(totalItems / limit);
	const page = Math.floor(offset / limit) + 1;

	return {
		limit,
		page,
		totalPages,
		total: totalItems,
	} as Pagination;
}

const isOffsetOutbounds = (pagination: Pagination) =>
	pagination.page > pagination.totalPages;
