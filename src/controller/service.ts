import { logger } from '../logger';
import servicesModel from '../database/services';
import { transact } from '../database';
import { TypeTransactionalRepository } from '../database/schemaBreakdown/type';

export async function deleteService({ name }) {
	return await transact(async (trx) => {
		const services = await servicesModel.deleteService(trx, name);
		if (services > 0) {
			const typeRepository = new TypeTransactionalRepository();
			await typeRepository.removeTypesByService(trx);
			logger.info('Deleted service from DB', { name });
		} else {
			logger.info('Service was not deleted from DB (not found)', {
				name,
			});
		}
		return services;
	});
}
