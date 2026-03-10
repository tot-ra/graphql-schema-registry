import Joi from 'joi';
import subscriptionsModel from '../database/subscriptions';

export async function push(req, res) {
	const source = Joi.attempt(
		req.body,
		Joi.object().keys({
			name: Joi.string().min(3).max(200).required(),
			version: Joi.string().min(1).max(100).required(),
			type_defs: Joi.string().required(),
			ws_url: Joi.string().uri().min(1).max(255).allow(''),
		})
	);

	const data = await subscriptionsModel.pushSubscriptionSource({ source });

	return res.json({
		success: true,
		data,
	});
}

export async function listLatest(req, res) {
	const sources = await subscriptionsModel.listLatestSources();
	const definitions = await subscriptionsModel.listDefinitions({
		sourceIds: sources.map((source) => source.id),
	});

	return res.json({
		success: true,
		data: {
			sources,
			definitions,
		},
	});
}
