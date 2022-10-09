import { Knex } from 'knex';
import { connection } from './index';

export interface ServiceRecord {
	id: string;
	name: string;
	url: string;
	is_active: boolean;
}

const servicesModel = {
	search: async function ({ filter = '', limit = 10 }) {
		const results = await connection('services')
			.select(['id', 'added_time', 'name'])
			.where('name', 'like', `%${filter}%`)
			.orderBy('added_time')
			.limit(limit);

		return results.map((row) => {
			return {
				__typename: 'Service',
				...row,
			};
		});
	},

	getActiveServices: async function (trx: Knex<ServiceRecord>) {
		return trx('services')
			.select('services.id', 'services.name', 'services.url')
			.where('is_active', true);
	},

	getServicesByIds: async function (
		trx: Knex<ServiceRecord>,
		ids = []
	): Promise<ServiceRecord[]> {
		return trx('services').select('*').whereIn('id', ids);
	},

	count: async function () {
		return (
			await connection('services')
				.where('is_active', true)
				.count('id', { as: 'amount' })
		)[0].amount;
	},

	getServices: async (trx: Knex, limit = 100, offset = 0) => {
		return trx('services').select('*').limit(limit).offset(offset);
	},

	getService: async function (trx: Knex<ServiceRecord>, name: string) {
		const service = await trx('services')
			.select('services.id', 'services.name')
			.where('services.name', name)
			.andWhere('is_active', true);

		return service[0];
	},

	insertService: async function (
		trx: Knex<ServiceRecord>,
		name: string,
		url: string
	) {
		await trx('services').insert({ name, url });

		const service = await servicesModel.getService(trx, name);

		if (!service) {
			throw new Error(`Failed to insert service: ${name}`);
		}

		return service;
	},

	deleteService: async function (trx: Knex<ServiceRecord>, name: string) {
		return trx('services').delete().where('name', name);
	},
};

export default servicesModel;
