import { parse } from 'graphql';
import { composeServices } from '@apollo/composition';

import { PublicError } from './error';
import { logger } from '../logger';

export function composeAndValidateSchema(servicesSchemaMap) {
	let schema;
	let errors = [];

	try {
		const serviceList = servicesSchemaMap.map((schema) => {
			const typeDefs = parse(schema.type_defs);

			return {
				name: schema.name,
				url: schema.url,
				typeDefs,
			};
		});

		({ schema, errors } = composeServices(serviceList));
	} catch (error) {
		logger.error(error.message);

		errors = [error];
	}

	if (errors && errors.length) {
		logger.error(errors);
		throw new PublicError('Schema validation failed', {
			details: errors,
		});
	}

	return schema;
}

export function composeSupergraph(servicesSchemaMap) {
	let supergraphSdl;
	let errors = [];

	try {
		const serviceList = servicesSchemaMap.map((schema) => {
			const typeDefs = parse(schema.type_defs);

			return {
				name: schema.name,
				url: schema.url,
				typeDefs,
			};
		});

		({ supergraphSdl, errors } = composeServices(serviceList));
	} catch (error) {
		logger.error(error.message);

		errors = [error];
	}

	if (errors && errors.length) {
		logger.error(errors);
		throw new PublicError('Schema validation failed', {
			details: errors,
		});
	}

	return supergraphSdl;
}
