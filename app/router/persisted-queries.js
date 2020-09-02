const Joi = require('joi');
const { get, set, getSince } = require('../database/persisted_queries');

exports.get = async (req, res) => {
	const key = Joi.attempt(req.query.key, Joi.string().required());
	const persistedQuery = await get({ key });

	return res.json({
		success: true,
		data: persistedQuery ? persistedQuery.query : null,
	});
};

exports.create = async (req, res) => {
	const { key, value } = Joi.attempt(
		req.body,
		Joi.object().keys({
			key: Joi.string().required(),
			value: Joi.string().required(),
		})
	);

	await set({
		persistedQuery: {
			key,
			query: value,
		},
	});

	return res.json({
		success: true,
	});
};
