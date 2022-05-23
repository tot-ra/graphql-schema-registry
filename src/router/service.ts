import Joi from 'joi';
import { deleteService } from '../controller/service';

export async function remove(req, res) {
	const params = Joi.attempt(
		req.params,
		Joi.object().keys({
			name: Joi.string().required(),
		})
	);

	const services = await deleteService({ name: params.name });

	return res.json({
		success: services > 0,
		data: null,
	});
}
