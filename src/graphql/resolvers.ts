import { isUndefined } from 'lodash';
import { parse } from 'graphql';

import { logger } from '../logger';

import {
	deactivateSchema,
	activateSchema,
	composeSupergraph,
} from '../controller/schema';
import config from '../config';
import { connection } from '../database';
import schemaModel from '../database/schema';
import containersModel from '../database/containers';
import servicesModel from '../database/services';

import schemaHit from '../database/schema_hits';
import operationHit from '../database/operation_hits';
import clientsModel from '../database/clients';
import subscriptionsModel from '../database/subscriptions';

import PersistedQueriesModel from '../database/persisted_queries';
import { getServiceHealthStatus } from './service-health';

const dateTime = new Intl.DateTimeFormat('en-GB', {
	weekday: 'long',
	year: 'numeric',
	month: 'long',
	day: 'numeric',
});

export default {
	Query: {
		services: async (_, { limit, offset }) =>
			await servicesModel.getServices(connection, limit, offset),
		service: async (_, { id }, { dataloaders }) =>
			await dataloaders.services.load(id),
		serviceCount: async () => await servicesModel.count(),
		subscriptionSources: async () =>
			await subscriptionsModel.listLatestSources(),
		subscriptionDefinitions: async (_, { sourceName }) =>
			await subscriptionsModel.listDefinitions({ sourceName }),
		supergraphSDL: async () => await composeSupergraph(connection),
		schema: async (_, { id }) => {
			const schema = await schemaModel.getSchemaById(connection, id);

			if (schema?.uuid && !schema?.UUID) {
				const { uuid, ...rest } = schema;
				const { id, ...otherFields } = rest;
				return {
					id,
					UUID: uuid,
					...otherFields,
				};
			}

			return schema;
		},
		schemaPropertyHitsByClient: async (_, { entity, property, granularity }) =>
			await schemaHit.get({ entity, property, granularity }),
		schemaFieldsUsage: async () => await schemaHit.listFields(),
		schemaChangeLog: async (_, { limit, offset, serviceName }) =>
			await schemaModel.getSchemaChangeLog({
				trx: connection,
				limit,
				offset,
				serviceName,
			}),
		schemaEntityHits: async (_, { granularity, hours }) =>
			await schemaHit.getEntityHits({ granularity, hours }),
		schemaClientHits: async (_, { granularity, hours }) =>
			await schemaHit.getClientHits({ granularity, hours }),
		schemaOperationHits: async (_, { granularity, hours }) =>
			await operationHit.getHits({ granularity, hours }),
		schemaTopOperations: async (_, { hours, limit }) =>
			await operationHit.getTopOperations({ hours, limit }),

		persistedQueries: async (
			parent,
			{ searchFragment, limit, offset, clientVersionId }
		) => {
			if (clientVersionId) {
				return await PersistedQueriesModel.getVersionPersistedQueries({
					version_id: clientVersionId,
				});
			}

			return await PersistedQueriesModel.list({
				searchFragment,
				limit,
				offset,
			});
		},
		persistedQuery: async (parent, { key }) => {
			return await PersistedQueriesModel.get(key);
		},
		persistedQueriesCount: async () => await PersistedQueriesModel.count(),

		clients: async () => await clientsModel.getClients(),
		logs: async () => {
			const logs = await new Promise((resolve, reject) =>
				logger.query(
					{
						// @ts-ignore
						from: new Date() - 24 * 60 * 60 * 1000,
						until: new Date(),
						limit: 100,
						start: 0,
						order: 'desc',
						fields: ['message', 'level', 'timestamp'],
					},
					function (err, results) {
						if (err) {
							reject(err);
						}

						resolve(results);
					}
				)
			);

			if (config.logStreamingEnabled) {
				// @ts-ignore
				return logs?.redis;
			}

			return '';
		},

		search: async (_, { filter }) => {
			if (filter.length < 2) {
				return null;
			}

			const [services, schemas] = await Promise.all([
				servicesModel.search({
					filter,
				}),
				schemaModel.search({ trx: connection, filter, limit: 10 }),
			]);

			return [...services, ...schemas];
		},
	},
	Mutation: {
		deactivateSchema: async (parent, { id }) => {
			await deactivateSchema({ id });
			const result = await schemaModel.getSchemaById(connection, id);

			return {
				...result,
				isActive: result.is_active,
			};
		},
		activateSchema: async (parent, { id }) => {
			await activateSchema({ id });
			const result = await schemaModel.getSchemaById(connection, id);

			return {
				...result,
				isActive: result.is_active,
			};
		},
	},
	SchemaHitByClientVersion: {
		version: ({ client_id }) => {
			return clientsModel.getClientVersion({ id: client_id });
		},
	},
	Service: {
		schemas: async ({ id }, { limit, offset, filter }, { dataloaders }) => {
			const schemas = await dataloaders.schemas.load({
				serviceId: id,
				limit,
				offset,
				filter,
			});

			return schemas;
		},
		healthStatus: async (parent) => getServiceHealthStatus(parent.url),
	},
	SchemaDefinition: {
		service: (parent, args, { dataloaders }) =>
			dataloaders.services.load(parent.service_id),
		containers: (parent) =>
			containersModel.getSchemaContainers({
				schemaId: parent.id,
			}),
		previousSchema: async (parent) => {
			const previousSchema = await schemaModel.getSchemaBefore({
				addedTime: parent.added_time,
				serviceId: parent.service_id,
				id: parent.id,
			});

			if (isUndefined(previousSchema)) {
				return null;
			}

			return previousSchema;
		},
		addedTime: (parent) => (parent.added_time ? parent.added_time : null),
		isActive: (parent) => parent.is_active,
		typeDefs: (parent) => parent.type_defs,
		containerCount: (parent) =>
			containersModel.getSchemaContainerCount(parent.id),
		isDev: (parent) => containersModel.isDev(parent.id),
		fieldsUsage: (parent) => {
			const sdl = parse(parent.type_defs);
			const result = [];

			for (const row of sdl.definitions) {
				if (row.kind === 'ObjectTypeDefinition') {
					for (const a of row.fields) {
						result.push({
							entity: row.name?.value,
							property: a.name?.value,
						});
					}
				}
			}

			return result;
		},
		UUID: (parent) => parent.UUID || parent.uuid || null,
	},
	SchemaField: {
		hitsSum: async (parent) => {
			if (!isUndefined(parent.hitsSum) && parent.hitsSum !== null) {
				return parent.hitsSum;
			}

			return await schemaHit.sum({
				entity: parent.entity,
				property: parent.property,
			});
		},
	},
	Container: {
		commitLink: (parent) => {
			if (parent.version === 'latest') {
				return null;
			}

			return config.formatCommitLink(
				parent.serviceName,
				parent.version.split('_')[0]
			);
		},
	},
	PersistedQuery: {
		addedTime: (parent) => dateTime.format(parent.added_time),
	},
	Client: {
		versions: (parent) => clientsModel.getVersions(parent.name),
	},
	ClientVersion: {
		client: (parent) => ({ name: parent.name }),
	},
};
