import { Knex } from 'knex';

export class BreakDownRepository<T, K> {
	constructor(private tableName: string, private columns: string[]) {}

	async insert(trx: Knex.Transaction, data: T[]): Promise<any> {
		if (data.length === 0) {
			return;
		}

		return trx.raw(`INSERT INTO ${this.tableName} (${this.columns.join(
			','
		)})
 						VALUES ${BreakDownRepository.insertBulkPayload(data, this.columns)}
 						ON DUPLICATE KEY UPDATE ${BreakDownRepository.onDuplicateUpdatePayload(
							this.columns
						)}`);
	}

	async get(
		trx: Knex.Transaction,
		data: string[] | number[],
		column: string
	): Promise<K[]> {
		if (data.length === 0) {
			return [];
		}
		return trx(this.tableName).select().whereIn(column, data);
	}

	async remove(
		trx: Knex.Transaction,
		data: string[] | number[],
		column: string
	): Promise<any> {
		if (data.length === 0) {
			return;
		}
		return trx(this.tableName).whereIn(column, data).delete();
	}

	private static onDuplicateUpdatePayload(columns: string[]): string {
		const args = columns.map(
			(columnName) => `${columnName} = VALUES(${columnName})`
		);
		return args.join(',');
	}

	private static insertBulkPayload(data: any[], columns: string[]): string {
		const insertData = data.map((i) => {
			const fields = columns.map((column) => {
				const value = i[column];
				if (value === undefined) return 'null';
				else if (typeof value === 'string') {
					let sanitized = value;
					if (value.endsWith('\\')) {
						sanitized = `${value} `;
					}

					const trailingSlashesSanitized = sanitized.replace(
						/'/g,
						"\\'"
					);
					return `'${trailingSlashesSanitized}'`;
				} else return value;
			});
			return `(${fields.join(',')})`;
		});

		return insertData.join(',');
	}
}
