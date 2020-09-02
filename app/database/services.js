const { knex } = require('./index');

const servicesModel = {
	getActiveServices: async function ({ trx = knex } = {}) {
		return trx('services')
			.select('services.id', 'services.name')
			.where('is_active', true);
	},

	getServicesByIds: async function ({ trx = knex, ids } = {}) {
		return trx('services').select('*').whereIn('id', ids);
	},

	getServices: async ({ limit = 100, offset = 0, trx = knex } = {}) => {
		return trx('services').select('*').limit(limit).offset(offset);
	},

	getService: async function ({ trx = knex, name }) {
		const service = await trx('services')
			.select('services.id', 'services.name')
			.where('services.name', name)
			.andWhere('is_active', true);

		return service[0];
	},

	insertService: async function ({ trx = knex, name }) {
		await trx('services').insert({ name });

		const service = await servicesModel.getService({ trx, name });

		if (!service) {
			throw new Error(`Failed to insert service: ${name}`);
		}

		return service;
	},

	toggleService: async function ({ trx = knex, name }, isActive) {
		return await trx('services')
			.update({
				is_active: isActive,
			})
			.where('name', name);
	},

	deleteService: async function ({ trx = knex, name }) {
		return trx('services').delete().where('name', name);
	},
};

module.exports = servicesModel;
