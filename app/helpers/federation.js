const logger = require('../logger');
const { parse } = require('graphql');
const { composeAndValidate } = require('@apollo/federation');

const { PublicError } = require('./error');

exports.composeAndValidateSchema = (servicesSchemaMap) => {
	let schema;
	let errors = [];

	try {
		const serviceList = servicesSchemaMap.map((schema) => {
			let typeDefs;

			typeDefs = parse(schema.type_defs);

			return {
				name: schema.name,
				url: '',
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
