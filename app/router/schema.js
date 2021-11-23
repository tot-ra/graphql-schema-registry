const Joi = require('joi');
const {
	getAndValidateSchema,
	validateSchema,
	pushAndValidateSchema,
	deactivateSchema,
	diffSchemas,
} = require('../controller/schema');
const diplomat = require('../diplomat');
const config = require('../config');
const { KAFKA_SCHEMA_REGISTRY } = require('../kafka/producer');

const { topic } = diplomat.getServiceInstance(KAFKA_SCHEMA_REGISTRY);

exports.composeLatest = async (req, res) => {
	const schema = await getAndValidateSchema();

	return res.json({
		success: true,
		data: schema,
	});
};

exports.compose = async (req, res) => {
	const { services } = Joi.attempt(
		req.body,
		Joi.object()
			.keys({
				services: Joi.array()
					.items(
						Joi.object().keys({
							name: Joi.string(),
							version: Joi.string(),
						})
					)
					.unique('name')
					.optional(),
			})
			.options({ stripUnknown: true })
	);

	const schema = await getAndValidateSchema({ services });

	return res.json({
		success: true,
		data: schema,
	});
};

exports.push = async (req, res) => {
	const service = Joi.attempt(
		req.body,
		Joi.object().keys({
			name: Joi.string().min(3).max(200).required(),
			version: Joi.string().min(1).max(100).required(),
			type_defs: Joi.string().required(),
			url: Joi.string().uri().min(1).max(255).allow(''),
		})
	);

	if (config.asyncSchemaUpdates) {
		await globalThis.kafkaProducer.send({
			topic,
			messages: [{ value: 'Schema Updated!' }],
		});
	}

	return res.json({
		success: true,
		data: await pushAndValidateSchema({ service }),
	});
};

exports.validate = async (req, res) => {
	const service = Joi.attempt(
		req.body,
		Joi.object().keys({
			name: Joi.string().min(3).max(200).required(),
			version: Joi.string().min(1).max(100).required(),
			type_defs: Joi.string().required(),
			url: Joi.string().uri().min(1).max(255).allow(''),
		})
	);

	return res.json({
		success: true,
		data: await validateSchema({ service }),
	});
};

exports.delete = async (req, res) => {
	const params = Joi.attempt(
		req.params,
		Joi.object().keys({
			schemaId: Joi.number().required(),
		})
	);

	await deactivateSchema({ id: params.schemaId });

	return res.json({
		success: true,
		data: null,
	});
};

exports.diff = async (req, res) => {
	const service = Joi.attempt(
		req.body,
		Joi.object().keys({
			name: Joi.string().min(3).max(200).required(),
			version: Joi.string().min(1).max(100).required(),
			type_defs: Joi.string().required(),
		})
	);

	return res.json({
		success: true,
		data: await diffSchemas({ service }),
	});
};
