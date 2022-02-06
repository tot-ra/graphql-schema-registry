import Knex from 'knex';
import { connection } from './index';

const servicesModel = {
	getActiveServices: async function (trx: Knex) {
		return trx('services')
			.select('services.id', 'services.name', 'services.url')
			.where('is_active', true);
	},

	getServicesByIds: async function (trx: Knex, ids = []) {
		return trx('services').select('*').whereIn('id', ids);
	},

	getServices: async (trx: Knex, limit = 100, offset = 0) => {
		return trx('services').select('*').limit(limit).offset(offset);
	},

	getService: async function (trx: Knex, name: string) {
		const service = await trx('services')
			.select('services.id', 'services.name')
			.where('services.name', name)
			.andWhere('is_active', true);

		return service[0];
	},

	insertService: async function (trx: Knex, name: string, url: string) {
		await trx('services').insert({ name, url });

		const service = await servicesModel.getService(trx, name);

		if (!service) {
			throw new Error(`Failed to insert service: ${name}`);
		}

		return service;
	},

	deleteService: async function (trx: Knex, name: string) {
		return trx('services').delete().where('name', name);
	},
};

export default servicesModel;
