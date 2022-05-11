export function onDuplicateUpdatePayload(columns: string[]): string {
	const args = columns.map(columnName => `${columnName} = VALUES(${columnName})`);
	return args.join(',');
}

export function insertBulkPayload(data: any[], columns: string[]): string {
	const insertData = data.map(i => {
		const fields = columns.map(column => {
			const value = i[column];
			if (value === undefined) return 'null';
			else if (typeof value === 'string') return `'${value}'`;
			else return value;
		})
		return `(${fields.join(',')})`;
	})

	return insertData.join(',');
}
