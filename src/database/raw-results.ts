export function rowsFromRaw<T = any>(rawResult: any): T[] {
	if (!rawResult) {
		return [];
	}

	if (Array.isArray(rawResult)) {
		return rawResult[0] || [];
	}

	if (Array.isArray(rawResult.rows)) {
		return rawResult.rows;
	}

	return [];
}

export function firstInsertId(insertResult: any): string | number | undefined {
	if (!Array.isArray(insertResult) || insertResult.length === 0) {
		return undefined;
	}

	const first = insertResult[0] as any;

	if (first && typeof first === 'object' && 'id' in first) {
		return first.id;
	}

	return first;
}
