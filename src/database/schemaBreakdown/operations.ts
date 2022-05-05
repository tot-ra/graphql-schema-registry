import Knex from 'knex';
import { connection } from '../index';

const table = 'operations';

interface OperationsContent {
    name?: string;
    description?: string;
    type?: string; // TODO: enum
    serviceId?: number;
}

const operationsModel = {
    insertOperation: async function (trx: Knex, content: OperationsContent) {
		await trx(table).insert(content);
	},
}

export default operationsModel;