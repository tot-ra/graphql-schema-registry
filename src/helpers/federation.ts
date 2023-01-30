import { parse } from 'graphql';
import { composeServices } from '@apollo/composition';

import { PublicError } from './error';
import { logger } from '../logger';

const parseSchemas = (servicesSchemaMap) => {
	return servicesSchemaMap.map((schema) => {
		const typeDefs = parse(schema.type_defs);

		return {
			name: schema.name,
			url: schema.url,
			typeDefs,
		};
	});
};

export function composeAndValidateSchema(servicesSchemaMap) {
	let schema;
	let errors = [];

	try {
		const serviceList = parseSchemas(servicesSchemaMap);

		({ schema, errors } = composeServices(serviceList));
	} catch (error) {
		logger.error(error.message);

		errors = [error];
	}

	if (errors && errors.length) {
		const err = new PublicError('Schema validation failed', {
			details: errors,
		});
		logger.error(err);
		throw err;
	}

	return schema;
}

export function getSuperGraph(servicesSchemaMap): string {
	const serviceList = parseSchemas(servicesSchemaMap);

	const { supergraphSdl } = composeServices(serviceList);

	return supergraphSdl;
}
