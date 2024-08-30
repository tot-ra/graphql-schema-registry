import Joi from 'joi';
import {
	getAndValidateSchema,
	validateSchema,
	pushAndValidateSchema,
	deactivateSchema,
	diffSchemas,
	composeSupergraph,
} from '../controller/schema';
import { connection } from '../database';
import config from '../config';
import * as kafka from '../kafka';

export async function composeLatest(req, res) {
	const schema = await getAndValidateSchema(connection, false, false);

	return res.json({
		success: true,
		data: schema,
	});
}

export async function supergraph(req, res) {
	const sdl = await composeSupergraph(connection);

	return res.set('Content-Type', 'text/plain').send(sdl);
}

export async function compose(req, res) {
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

	const schema = await getAndValidateSchema(connection, services);

	return res.json({
		success: true,
		data: schema,
	});
}

export async function push(req, res) {
	const service = Joi.attempt(
		req.body,
		Joi.object().keys({
			name: Joi.string().min(3).max(200).required(),
			version: Joi.string().min(1).max(100).required(),
			type_defs: Joi.string().required(),
			url: Joi.string().uri().min(1).max(255).allow(''),
		})
	);

	const data = await pushAndValidateSchema({ service });

	if (config.asyncSchemaUpdates) {
		await kafka.send(data);
	}

	return res.json({
		success: true,
		data,
	});
}

export async function validate(req, res) {
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
}

export async function remove(req, res) {
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
}

export async function diff(req, res) {
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
}
