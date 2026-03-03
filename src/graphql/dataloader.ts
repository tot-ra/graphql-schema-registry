import Dataloader from 'dataloader';
import _ from 'lodash';
import servicesModel from '../database/services';
import schemaModel from '../database/schema';

type DataloaderSet = {
	schemas: Dataloader<unknown, unknown>;
	services: Dataloader<unknown, unknown>;
};

export default (connection): DataloaderSet => ({
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
				keys.map(({ serviceId }) => {
					const normalizedServiceId = String(serviceId);
					return [
						normalizedServiceId,
						schemas.filter(
							(schema) =>
								String((schema as Record<string, unknown>).service_id) ===
								normalizedServiceId
						),
					];
				})
			);

			return serviceIds.map((id) => {
				const r = byIds.get(String(id));
				return r ? r : null;
			});
		},
		{
			cacheKeyFn: ({ serviceId }) => serviceId,
		}
	),

	services: new Dataloader(async (ids: string[]) => {
		const services = await servicesModel.getServicesByIds(connection, ids);
		const byIds = new Map(
			services.map((service) => [String(service.id), service])
		);

		return ids.map((id) => {
			const r = byIds.get(String(id));
			return r ? r : null;
		});
	}),
});
