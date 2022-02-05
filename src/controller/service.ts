import logger from '../logger';
import servicesModel from '../database/services';

export async function deleteService ({ name }) {
	const services = await servicesModel.deleteService({ name });
	if (services > 0) {
		logger.info('Deleted service from DB', { name });
	} else {
		logger.info('Service was not deleted from DB (not found)', { name });
	}
	return services;
};
