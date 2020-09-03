const { diff } = require('@graphql-inspector/core');
const logger = require('../logger');

const { transact } = require('../database');
const { composeAndValidateSchema } = require('../helpers/federation');
const {
	getLastUpdatedForActiveServices,
	getSchemaByServiceVersions,
	registerSchema,
	toggleSchema,
} = require('../database/schema');

async function getAndValidateSchema({ trx, services } = {}) {
	const schemas = services
		? await getSchemaByServiceVersions({ trx, services })
		: await getLastUpdatedForActiveServices({ trx });

	logger.info(
		'Validating schema. Got services schemas from DB transaction..',
		{
			schemas,
		}
	);

	composeAndValidateSchema(schemas);

	return schemas;
}

exports.getAndValidateSchema = getAndValidateSchema;

exports.pushAndValidateSchema = async ({ service }) => {
	return await transact(async (trx) => {
		const schema = await registerSchema({ trx, service });

		logger.info('Registered service new schema in DB transaction..', {
			schema,
		});

		await getAndValidateSchema({ trx });

		return schema;
	});
};

exports.validateSchema = async ({ service }) => {
	return await transact(async (trx) => {
		const schemas = await getLastUpdatedForActiveServices({ trx });

		composeAndValidateSchema(
			schemas
				.filter((schema) => schema.name !== service.name)
				.concat(service)
		);
	});
};

exports.deactivateSchema = async ({ id }) => {
	return await transact(async (trx) => {
		await toggleSchema({ trx, id }, false);
		await getAndValidateSchema({ trx });
	});
};

exports.activateSchema = async ({ id }) => {
	return await transact(async (trx) => {
		await toggleSchema({ trx, id }, true);
		await getAndValidateSchema({ trx });
	});
};

exports.diffSchemas = async ({ service }) => {
	return await transact(async (trx) => {
		const schemas = await getLastUpdatedForActiveServices({ trx });

		const original = composeAndValidateSchema(schemas);
		const updated = composeAndValidateSchema(
			schemas
				.filter((schema) => schema.name !== service.name)
				.concat(service)
		);

		return diff(original, updated);
	});
};
