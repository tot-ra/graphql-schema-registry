import Joi from 'joi';
import PersistedQueriesModel from '../database/persisted_queries';

export async function get (req, res) {
	const key = Joi.attempt(req.query.key, Joi.string().required());
	const persistedQuery = await PersistedQueriesModel.get( key );

	return res.json({
		success: true,
		data: persistedQuery ? persistedQuery.query : null,
	});
};

export async function create (req, res) {
	const { key, value } = Joi.attempt(
		req.body,
		Joi.object().keys({
			key: Joi.string().required(),
			value: Joi.string().required(),
		})
	);

	await PersistedQueriesModel.set({
		persistedQuery: {
			key,
			query: value,
		},
	});

	return res.json({
		success: true,
	});
};
