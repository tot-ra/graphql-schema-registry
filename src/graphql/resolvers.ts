import { isUndefined } from 'lodash';
import { parse } from 'graphql';

import { deactivateSchema, activateSchema } from '../controller/schema';
import config from '../config';
import { connection } from '../database';
import schemaModel from '../database/schema';
import containersModel from '../database/containers';
import servicesModel from '../database/services';

import schemaHit from '../database/schema_hits';
import clientsModel from '../database/clients';

import PersistedQueriesModel from '../database/persisted_queries';

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
		schema: async (_, { id }) =>
			await schemaModel.getSchemaById(connection, id),
		schemaPropertyHitsByClient: async (_, { entity, property }) =>
			await schemaHit.get({ entity, property }),

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
	},
	SchemaField: {
		hitsSum: async (parent) => {
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
