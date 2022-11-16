import { Knex } from 'knex';
import { connection } from './index';

export interface ServiceRecord {
	id: string;
	name: string;
	url: string;
	is_active: boolean;
}

export const servicesTable = 'services';

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
		return trx(servicesTable)
			.select(
				`${servicesTable}.id`,
				`${servicesTable}.name`,
				`${servicesTable}.url`
			)
			.where('is_active', true);
	},

	getServicesByIds: async function (
		trx: Knex<ServiceRecord>,
		ids = []
	): Promise<ServiceRecord[]> {
		return trx(servicesTable).select('*').whereIn('id', ids);
	},

	count: async function () {
		return (
			await connection(servicesTable)
				.where('is_active', true)
				.count('id', { as: 'amount' })
		)[0].amount;
	},

	getServices: async (trx: Knex, limit = 100, offset = 0) => {
		return trx(servicesTable).select('*').limit(limit).offset(offset);
	},

	getService: async function (trx: Knex<ServiceRecord>, name: string) {
		const service = await trx(servicesTable)
			.select(`${servicesTable}.id`, `${servicesTable}.name`)
			.where(`${servicesTable}.name`, name)
			.andWhere('is_active', true);

		return service[0];
	},

	insertService: async function (
		trx: Knex<ServiceRecord>,
		name: string,
		url: string
	) {
		await trx(servicesTable).insert({ name, url });

		const service = await servicesModel.getService(trx, name);

		if (!service) {
			throw new Error(`Failed to insert service: ${name}`);
		}

		return service;
	},

	deleteService: async function (trx: Knex<ServiceRecord>, name: string) {
		return trx(servicesTable).delete().where('name', name);
	},
};

export default servicesModel;
