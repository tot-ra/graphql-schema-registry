import { parse } from 'graphql';
import { composeAndValidate } from '@apollo/federation';

import { PublicError } from './error';
import { logger } from "../logger";

export function composeAndValidateSchema (servicesSchemaMap) {
	let schema;
	let errors = [];

	try {
		const serviceList = servicesSchemaMap.map((schema) => {
			let typeDefs;

			typeDefs = parse(schema.type_defs);

			return {
				name: schema.name,
				url: schema.url,
				typeDefs,
			};
		});

		({ schema, errors } = composeAndValidate(serviceList));
	} catch (error) {
		logger.error(error.message);

		errors = [error];
	}

	if (errors && errors.length) {
		throw new PublicError('Schema validation failed', {
			details: errors,
		});
	}

	return schema;
};
