const { knex } = require('./index');

exports.getActiveServices = async ({ trx = knex } = {}) => {
	return await trx('services')
		.select('services.id', 'services.name')
		.where('is_active', true);
};

exports.getServicesByIds = async ({ trx = knex, ids } = {}) => {
	return await trx('services')
		.select('*')
		.whereIn('id', ids);
};

exports.getServices = async ({ limit = 100, offset = 0, trx = knex } = {}) => {
	return await trx('services')
		.select('*')
		.limit(limit)
		.offset(offset);
};

exports.getService = async ({ trx = knex, name }) => {
	const service = await trx('services')
		.select('services.id', 'services.name')
		.where('services.name', name)
		.andWhere('is_active', true);

	return service[0];
};

exports.insertService = async ({ trx = knex, name }) => {
	await trx('services').insert({ name });

	const service = await exports.getService({ trx, name });

	if (!service) {
		throw new Error(`Failed to insert service: ${name}`);
	}

	return service;
};

exports.toggleService = async ({ trx = knex, name }, isActive) => {
	return await trx('services')
		.update({
			is_active: isActive
		})
		.where('name', name);
};

exports.deleteService = async ({ trx = knex, name }) => {
	return await trx('services')
		.delete()
		.where('name', name);
};
