import Dataloader from 'dataloader';
import _ from 'lodash';
import servicesModel from '../database/services';
import schemaModel from '../database/schema';
import { connection } from '../database';

export default () => ({
	schemas: new Dataloader(
		async (keys) => {
			const serviceIds = keys.map((key: any) => key.serviceId);
			const schemas = await schemaModel.getSchemasForServices({
				serviceIds,
				limit: _.get(keys, '[0].limit'),
				offset: _.get(keys, '[0].offset'),
				filter: _.get(keys, '[0].filter'),
				trx: connection,
			});

			const byIds = new Map(
				keys.map(({ serviceId }) => [
					serviceId,
					schemas.filter((schema) => schema.service_id === serviceId),
				])
			);

			return serviceIds.map((id) => byIds.get(id));
		},
		{
			cacheKeyFn: ({ serviceId }) => serviceId,
		}
	),

	services: new Dataloader(async (ids: string[]) => {
		const services = await servicesModel.getServicesByIds(connection, ids);
		const byIds = new Map(services.map((service) => [service.id, service]));

		return ids.map((id) => byIds.get(id));
	}),
});
