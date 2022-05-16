import { isUndefined } from 'lodash';

import { deactivateSchema, activateSchema } from '../controller/schema';
import config from '../config';
import { connection } from '../database';
import schemaModel from '../database/schema';
import containersModel from '../database/containers';
import servicesModel from '../database/services';
import PersistedQueriesModel from '../database/persisted_queries';
import listTypeInstances from './resolvers/listTypeInstances';
import listTypes from './resolvers/listTypes';

const dateTime = new Intl.DateTimeFormat('en-GB', {
	weekday: 'long',
	year: 'numeric',
	month: 'long',
	day: 'numeric',
});

export default {
	Query: {
		services: async (parent, { limit, offset }) =>
			servicesModel.getServices(connection, limit, offset),
		service: async (parent, { id }, { dataloaders }) =>
			dataloaders.services.load(id),
		schema: async (parent, { id }) =>
			await schemaModel.getSchemaById(connection, id),

		persistedQueries: async (parent, { searchFragment, limit, offset }) => {
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
		listTypes,
		listTypeInstances,
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
};

export interface Pagination {
	limit: number;
	page: number;
	totalPages: number;
}

export async function getPaginatedResult<T>(
	totalItems: number,
	limit: number,
	offset: number,
	result: (safeOffset) => T
) {
	let pagination = getPagination(limit, offset, totalItems);
	let safeOffset = offset;
	if (isOffsetOutbounds(pagination)) {
		pagination = { ...pagination, page: 1 };
		safeOffset = 0;
	}
	return {
		pagination,
		...await result(safeOffset),
	};
}

function getPagination(
	limit: number,
	offset: number,
	totalItems: number
): Pagination {
	const totalPages = Math.ceil(totalItems / limit);
	let page = Math.floor(offset / limit) + 1;

	return {
		limit,
		page,
		totalPages,
	} as Pagination;
}

const isOffsetOutbounds = (pagination: Pagination) =>
	pagination.page > pagination.totalPages;
