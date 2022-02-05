import { connection } from './index';

const servicesModel = {
	getActiveServices: async function ({ trx = connection } = {}) {
		return trx('services')
			.select('services.id', 'services.name', 'services.url')
			.where('is_active', true);
	},

	getServicesByIds: async function ({ trx = connection, ids = []} = {}) {
		return trx('services').select('*').whereIn('id', ids);
	},

	getServices: async ({ limit = 100, offset = 0, trx = connection } = {}) => {
		return trx('services').select('*').limit(limit).offset(offset);
	},

	getService: async function ({ trx = connection, name }) {
		const service = await trx('services')
			.select('services.id', 'services.name')
			.where('services.name', name)
			.andWhere('is_active', true);

		return service[0];
	},

	insertService: async function ({ trx = connection, name, url }) {
		await trx('services').insert({ name, url });

		const service = await servicesModel.getService({ trx, name });

		if (!service) {
			throw new Error(`Failed to insert service: ${name}`);
		}

		return service;
	},

	deleteService: async function ({ trx = connection, name }) {
		return trx('services').delete().where('name', name);
	},
};

export default servicesModel;
