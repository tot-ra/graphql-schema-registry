import {FieldPayload} from "../../model/field";
import {Transaction} from "knex";

interface FieldService {
	insertIgnoreFields(data: FieldPayload[]): Promise<void>
}

export class FieldTransactionRepository implements FieldService {
	static tableName = 'type_def_fields';

	constructor(private trx: Transaction) {
	}

	async insertIgnoreFields(data: FieldPayload[]) {
		return this.trx
			.raw(`INSERT INTO ${FieldTransactionRepository.tableName} (name, is_nullable, is_array, is_array_nullable, is_deprecated, parent_type_id, children_type_id) VALUES ${FieldTransactionRepository.insertBulkPayload(data)}`)
	}

	private static insertBulkPayload(data: FieldPayload[]): string {
		const insertData = data.map(i => {
			return `('${i.name}', ${i.is_nullable ? 1 : 0}, ${i.is_array ? 1 : 0}, ${i.is_array_nullable ? 1 : 0}, ${i.is_deprecated ? 1 : 0}, ${i.parent_type_id}, ${i.children_type_id})`;
		})

		return insertData.join(',');
	}
}
