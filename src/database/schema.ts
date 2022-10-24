import { Knex } from 'knex';
import { unionBy } from 'lodash';
import crypto from 'crypto';
import { print, parse } from 'graphql';

import { connection } from './index';
import servicesModel from './services';
import { PublicError } from '../helpers/error';
import { logger } from '../logger';

function isDevVersion(version: string) {
	return version === 'latest';
}

interface SchemaRecord {
	id: string;
	type_defs: string;
	is_active: boolean;
}

const schemaModel = {
	search: async function ({
		limit = 10,
		filter = '',
		trx,
	}: {
		limit: number;
		filter: string;
		trx: Knex<SchemaRecord>;
	}) {
		const results = await trx('schema')
			.select(
				'schema.*',
				connection.raw('CHAR_LENGTH(schema.type_defs) as characters')
			)
			.leftJoin(
				'container_schema',
				'container_schema.schema_id',
				'schema.id'
			)
			.where((builder) => {
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
			.limit(limit);

		return results.map((row) => {
			return {
				__typename: 'SchemaDefinition',
				...row,
			};
		});
	},
	getLatestAddedDate: async function () {
		const latest = await connection('schema')
			.max('added_time as added_time')
			.first();

		return latest.added_time;
	},

	getSchemaLastUpdated: async function ({ trx, services }) {
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
			   AND (
						 t4.added_time = t2.max_added_time OR
						 t1.id = t2.max_id
				 )
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

	getLastUpdatedForActiveServices: async function ({ trx }: { trx: Knex }) {
		return schemaModel.getSchemaLastUpdated({
			trx,
			services: await servicesModel.getActiveServices(trx),
		});
	},

	getSchemaByServiceVersions: async function ({ trx, services }) {
		services = unionBy(
			services,
			await servicesModel.getActiveServices(trx),
			'name'
		);

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
						`Unable to find "${service.name}:${service.version}" schema, fallback to the latest`
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
				`Unable to find schema for requested services: "${missingServices}"`
			);
		}

		return schema;
	},

	// eslint-disable-next-line complexity
	registerSchema: async function ({ trx, service }) {
		const addedTime = service.added_time
			? new Date(service.added_time)
			: new Date();

		// SERVICE
		let existingService = await servicesModel.getService(trx, service.name);

		if (!existingService) {
			existingService = await servicesModel.insertService(
				trx,
				service.name,
				service.url
			);
		} else if (service.url && existingService.url !== service.url) {
			await trx('services')
				.where('id', '=', existingService.id)
				.update({ url: service.url });
		}

		const serviceId = existingService.id;

		logger.info(`Registering schema with serviceId = ${serviceId}`);

		// SCHEMA
		let schemaId = await findExistingSchema(
			trx,
			serviceId,
			service.type_defs
		);

		if (
			!isDevVersion(service.version) &&
			existingService &&
			!schemaId &&
			(await versionExists(trx, existingService.id, service.version))
		) {
			const message =
				`Schema [${existingService.name}] and version [${service.version}] already exist in registry. ` +
				`You should not register different type_defs with same version.`;
			throw new PublicError(message, null);
		}

		if (schemaId) {
			await trx('schema')
				.where('id', '=', schemaId)
				.update({ updated_time: addedTime });
		} else {
			const type_defs_normalized = normalizeTypeDefs(service.type_defs);

			[schemaId] = await trx('schema').insert(
				{
					service_id: serviceId,
					UUID: generateUUID(type_defs_normalized),
					type_defs: type_defs_normalized,
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

	toggleSchema: async function (
		{ trx, id }: { trx: Knex<SchemaRecord>; id: string },
		isActive
	) {
		return trx('schema')
			.update({
				is_active: isActive,
			})
			.where({
				id,
			});
	},

	getSchemasForServices: async function ({
		serviceIds,
		limit = 100,
		offset = 0,
		trx,
	}: {
		serviceIds: string[];
		limit: number;
		offset: number;
		filter: string;
		trx: Knex<SchemaRecord>;
	}) {
		const schemas = await trx('schema')
			.select(
				'schema.*',
				connection.raw('CHAR_LENGTH(schema.type_defs) as characters')
			)
			.leftJoin(
				'container_schema',
				'container_schema.schema_id',
				'schema.id'
			)
			.whereIn('schema.service_id', serviceIds)
			.orderBy('schema.added_time', 'desc')
			.groupBy('schema.id')
			.offset(offset)
			.limit(limit);

		return schemas;
	},

	getSchemaBefore: async function ({ addedTime, id, serviceId }) {
		return connection('schema')
			.select(
				'schema.*',
				connection.raw('CHAR_LENGTH(schema.type_defs) as characters')
			)
			.where('added_time', '<=', addedTime)
			.andWhere('id', '!=', id)
			.andWhere('service_id', '=', serviceId)
			.orderBy('added_time', 'DESC')
			.first();
	},

	getSchemaById: async function (trx: Knex<SchemaRecord>, id) {
		const schema = await trx('schema')
			.select(
				'schema.*',
				connection.raw('CHAR_LENGTH(schema.type_defs) as characters')
			)
			.where('schema.id', id)
			.first();

		if (!schema) {
			return null;
		}

		return schema;
	},

	listMigrateableSchemas: async function (knex, limit = 100) {
		return await knex('schema')
			.select(['schema.id', 'schema.type_defs', 'schema.is_active'])
			.whereNull('schema.UUID')
			.limit(limit);
	},

	addUUIDToAllSchemas: async function (knex, limit = 100) {
		let count = null;
		let offset = 0;

		while (count !== 0) {
			const schemas = await schemaModel.listMigrateableSchemas(
				knex,
				limit
			);

			offset = offset + limit;
			count = schemas ? schemas.length : 0;

			for (const row of schemas) {
				const type_defs = normalizeTypeDefs(row.type_defs);

				await knex('schema')
					.where('id', '=', row.id)
					.update({
						UUID: generateUUID(type_defs),
						type_defs, // make new type defs pretty
						updated_time: row.updated_time, // keep old update time
					});
			}
		}
	},
};

function normalizeTypeDefs(sdl) {
	return print(parse(sdl));
}

function generateUUID(type_defs_normalized) {
	const schemaPropertiesDefiningUniqueness = [type_defs_normalized].join('.');

	return crypto
		.createHash('md5')
		.update(schemaPropertiesDefiningUniqueness)
		.digest('hex');
}

async function findExistingSchema(trx, serviceId, type_defs) {
	return (
		await trx('schema')
			.select('id')
			.where({
				service_id: serviceId,
				UUID: generateUUID(normalizeTypeDefs(type_defs)),
			})
	)[0]?.id;
}

async function versionExists(trx, serviceId, version) {
	return (
		await trx('container_schema').select('id').where({
			service_id: serviceId,
			version,
		})
	)[0]?.id;
}

export default schemaModel;
