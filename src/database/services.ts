import Knex from 'knex';

export const servicesTable = 'services';

const servicesModel = {
	getActiveServices: async function (trx: Knex) {
		return trx(servicesTable)
			.select(`${servicesTable}.id`, `${servicesTable}.name`, `${servicesTable}.url`)
			.where('is_active', true);
	},

	getServicesByIds: async function (trx: Knex, ids = []) {
		return trx(servicesTable).select('*').whereIn('id', ids);
	},

	getServices: async (trx: Knex, limit = 100, offset = 0) => {
		return trx(servicesTable).select('*').limit(limit).offset(offset);
	},

	getService: async function (trx: Knex, name: string) {
		const service = await trx(servicesTable)
			.select(`${servicesTable}.id`, `${servicesTable}.name`)
			.where(`${servicesTable}.name`, name)
			.andWhere('is_active', true);

		return service[0];
	},

	insertService: async function (trx: Knex, name: string, url: string) {
		await trx(servicesTable).insert({ name, url });

		const service = await servicesModel.getService(trx, name);

		if (!service) {
			throw new Error(`Failed to insert service: ${name}`);
		}

		return service;
	},

	deleteService: async function (trx: Knex, name: string) {
		return trx(servicesTable).delete().where('name', name);
	},
};

export default servicesModel;
