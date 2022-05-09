import Joi from 'joi';
import { deleteService } from '../controller/service';
import {OperationRepository} from "../database/schemaBreakdown/operations";
import {insertOperation} from "../controller/schemaBreakdown/operation";
import {BreakDownSchemaCaseUse} from "../controller/schemaBreakdown/breakdown";
import {transact} from "../database";

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
};

export async function test(req, res) {
	return await transact(async (trx) => {
		// return breakdown({trx, type_defs: req.body.type_defs, service_id: 14});
		return new BreakDownSchemaCaseUse(
			trx,
			req.body.type_defs,
			14
		).breakDown();
	});

}
