import {Transaction} from "knex";

export class BreakDownRepository<T, K> {
	constructor(
		private tableName: string,
		private columns: string[]
	) {}

	async insert(trx: Transaction, data: T[]): Promise<any> {
		return trx
			.raw(`INSERT INTO ${this.tableName} (${this.columns.join(',')})
 						VALUES ${BreakDownRepository.insertBulkPayload(data, this.columns)}
 						ON DUPLICATE KEY UPDATE ${BreakDownRepository.onDuplicateUpdatePayload(this.columns)}`)
	}

	async get(trx: Transaction, data: string[] | number[], column: string): Promise<K[]> {
		return trx(this.tableName)
			.select()
			.whereIn(column, data);
	}

	async remove(trx: Transaction, data: string[] | number[], column: string): Promise<any> {
		return trx(this.tableName)
			.whereIn(column, data)
			.delete()
	}

	private static onDuplicateUpdatePayload(columns: string[]): string {
		const args = columns.map(columnName => `${columnName} = VALUES(${columnName})`);
		return args.join(',');
	}

	private static insertBulkPayload(data: any[], columns: string[]): string {
		const insertData = data.map(i => {
			const fields = columns.map(column => {
				const value = i[column];
				if (value === undefined) return 'null';
				else if (typeof value === 'string') return `'${value}'`;
				else return value;
			})
			return `(${fields.join(',')})`;
		});

		return insertData.join(',');
	}
}
