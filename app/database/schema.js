const { unionBy } = require('lodash');
const logger = require('../logger');
const { knex } = require('./index');
const { getActiveServices, getService, insertService } = require('./services');

function isDevVersion(version) {
	return version === 'latest' || !version;
}

const schemaModel = {
	getSchemasAddedAfter: async function ({ trx = knex, since }) {
		return trx('container_schema')
			.select([
				'container_schema.*',
				'services.name',
				knex.raw('CHAR_LENGTH(schema.type_defs) as characters'),
			])
			.leftJoin('services', 'container_schema.service_id', 'services.id')
			.andWhere((knex) => {
				return knex.where('schema.added_time', '>', since);
			})
			.limit(100);
	},

	getLatestAddedDate: async function () {
		const latest = await knex('schema')
			.max('added_time as added_time')
			.first();

		return latest.added_time;
	},

	getSchemaLastUpdated: async function ({ trx = knex, services }) {
		const names = services.map((service) => service.name);

		if (!names || !names.length) {
			return [];
		}

		const latestSchemaCandidates = await trx.raw(
			`SELECT t1.id,
						t1.service_id,
						t1.version,
						t3.name,
						t3.url,
						t4.added_time,
						t4.type_defs,
						t4.is_active
				 FROM \`container_schema\` as t1
						  INNER JOIN (
					 SELECT MAX(cs1.added_time) as max_added_time,
							MAX(cs1.id)         as max_id,
							cs1.service_id
					 FROM \`container_schema\` cs1
					 	INNER JOIN \`schema\` s1 on cs1.schema_id = s1.id
					 WHERE s1.is_active <> 0
					 GROUP BY cs1.service_id
				 ) as t2 ON t2.service_id = t1.service_id
						  INNER JOIN \`services\` t3 ON t3.id = t1.service_id
						  INNER JOIN \`schema\` t4 ON t4.id = t1.schema_id
				 WHERE t3.name IN (?)
				   AND t3.id = t2.service_id
				   AND t4.is_active = TRUE
				 ORDER BY t1.service_id, t1.added_time DESC, t1.id DESC`,
			[names]
		);

		if (!latestSchemaCandidates || !latestSchemaCandidates.length) {
			return [];
		}

		const schemas = latestSchemaCandidates[0];
		const result = {};

		for (const next of schemas) {
			const prev = result[next.service_id];

			// fill first value, no need to check that service_id is the same
			if (!prev) {
				result[next.service_id] = next;
				continue;
			}

			const prevChangeTime = new Date(prev.added_time);
			const nextChangeTime = new Date(next.added_time);

			// // order by added_time
			if (nextChangeTime > prevChangeTime) {
				result[next.service_id] = next;
				continue;
			}

			// order by schema.id if change time is the same
			if (prev.added_time === next.added_time && next.id > prev.id) {
				result[next.service_id] = next;
			}
		}

		return Object.values(result);
	},

	getLastUpdatedForActiveServices: async function ({ trx = knex }) {
		return schemaModel.getSchemaLastUpdated({
			trx,
			services: await getActiveServices({ trx }),
		});
	},

	getSchemaByServiceVersions: async function ({ trx = knex, services }) {
		services = unionBy(services, await getActiveServices({ trx }), 'name');

		const schema = await trx('container_schema')
			.select([
				'container_schema.*',
				'services.name',
				'services.url',
				'schema.is_active',
				'schema.type_defs',
			])
			.innerJoin('services', 'container_schema.service_id', 'services.id')
			.innerJoin('schema', 'container_schema.schema_id', 'schema.id')
			.where((query) => {
				services.forEach((service) => {
					const skip =
						!service.name ||
						!service.version ||
						isDevVersion(service.version);

					query.orWhere({
						'services.name': skip ? null : service.name,
						'container_schema.version': skip
							? null
							: service.version,
					});
				});
			})
			.andWhere({
				'services.is_active': true,
			});

		const servicesToFallback = services.reduce((result, service) => {
			if (!schema.find((schema) => schema.name === service.name)) {
				result.push(service);

				if (!isDevVersion(service.version)) {
					logger.warn(
						new Error(
							`Unable to find "${service.name}:${service.version}" schema, fallback to the latest`
						),
						{
							service,
						}
					);
				}
			}

			return result;
		}, []);

		schema.push(
			...(await schemaModel.getSchemaLastUpdated({
				trx,
				services: servicesToFallback,
			}))
		);

		const missingServices = [];

		services.forEach((service) => {
			if (!schema.find((schema) => schema.name === service.name)) {
				missingServices.push(service);
			}
		});

		if (missingServices.length) {
			logger.warn(
				new Error('Unable to find schema for requested services'),
				{
					missingServices,
				}
			);
		}

		return schema;
	},

	registerSchema: async function ({ trx = knex, service }) {
		const addedTime = service.added_time
			? new Date(service.added_time)
			: new Date();

		// SERVICE
		let existingService = await getService({ trx, name: service.name });

		if (!existingService) {
			existingService = await insertService({ trx, name: service.name, url: service.url });
		} else if (service.url && existingService.url != service.url ) {
			await trx('services')
				.where('id', '=', existingService.id)
				.update({ url: service.url });
		}

		const serviceId = existingService.id;

		logger.info(`Registering schema with serviceId = ${serviceId}`);

		// SCHEMA
		let schemaId = (
			await trx('schema').select('id').where({
				service_id: serviceId,
				type_defs: service.type_defs,
			})
		)[0]?.id;

		if (schemaId) {
			await trx('schema')
				.where('id', '=', schemaId)
				.update({ updated_time: addedTime });
		} else {
			[schemaId] = await trx('schema').insert(
				{
					service_id: serviceId,
					type_defs: service.type_defs,
					added_time: addedTime,
				},
				['id']
			);
		}

		logger.info(`Registering schema with schemaId = ${schemaId}`);

		// CONTAINER
		let containerId;

		if (isDevVersion(service.version)) {
			containerId = (
				await trx('container_schema').select('id').where({
					service_id: serviceId,
					version: service.version,
				})
			)[0]?.id;

			// switch "latest" version between schemas
			if (containerId) {
				await trx('container_schema')
					.where({
						service_id: serviceId,
						version: service.version,
					})
					.update({
						schema_id: schemaId,
					});
			}
		} else {
			containerId = (
				await trx('container_schema').select('id').where({
					schema_id: schemaId,
					service_id: serviceId,
					version: service.version,
				})
			)[0]?.id;
		}

		if (!containerId) {
			containerId = await trx('container_schema').insert(
				{
					schema_id: schemaId,
					service_id: serviceId,
					version: service.version,
					added_time: addedTime,
				},
				['id']
			);
		}

		logger.info(`Registering schema with containerId = ${containerId}`);

		const result = await schemaModel.getSchemaByServiceVersions({
			trx,
			services: [service],
		});

		return result[0];
	},

	toggleSchema: async function ({ trx, id }, isActive) {
		return trx('schema')
			.update({
				'schema.is_active': isActive,
			})
			.where({
				id,
			});
	},

	getSchemasForServices: async function ({
		serviceIds,
		limit = 100,
		offset = 0,
		filter = '',
		trx = knex,
	}) {
		const schemas = await trx('schema')
			.select(
				'schema.*',
				knex.raw('CHAR_LENGTH(schema.type_defs) as characters')
			)
			.leftJoin(
				'container_schema',
				'container_schema.schema_id',
				'schema.id'
			)
			.whereIn('schema.service_id', serviceIds)
			.andWhere((builder) => {
				const result = builder.where(
					'container_schema.version',
					'like',
					`%${filter}%`
				);

				if (filter[0] === '!') {
					result.orWhere(
						'schema.type_defs',
						'not like',
						`%${filter.substring(1)}%`
					);
				} else {
					result.orWhere('schema.type_defs', 'like', `%${filter}%`);
				}

				return result;
			})
			.orderBy('schema.added_time', 'desc')
			.groupBy('schema.id')
			.offset(offset)
			.limit(limit);

		return schemas;
	},

	getSchemaBefore: async function ({ trx = knex, addedTime, id, serviceId }) {
		return trx('schema')
			.select(
				'schema.*',
				knex.raw('CHAR_LENGTH(schema.type_defs) as characters')
			)
			.where('added_time', '<=', addedTime)
			.andWhere('id', '!=', id)
			.andWhere('service_id', '=', serviceId)
			.orderBy('added_time', 'DESC')
			.first();
	},

	getSchemaById: async function ({ trx = knex, id }) {
		return trx('schema')
			.select(
				'schema.*',
				knex.raw('CHAR_LENGTH(schema.type_defs) as characters')
			)
			.where('schema.id', id)
			.first();
	},

	deleteSchema: async function ({ trx, name, version }) {
		return trx('container_schema')
			.delete()
			.leftJoin('services', 'container_schema.service_id', 'services.id')
			.where({
				'services.name': name,
				'container_schema.version': version,
			});
	},
};

module.exports = schemaModel;
