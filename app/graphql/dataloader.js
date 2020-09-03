const Dataloader = require('dataloader');
const _ = require('lodash');
const { getServicesByIds } = require('../database/services');
const { getSchemasForServices } = require('../database/schema');

module.exports = () => ({
	schemas: new Dataloader(
		async (keys) => {
			const serviceIds = keys.map((key) => key.serviceId);
			const schemas = await getSchemasForServices({
				serviceIds,
				limit: _.get(keys, '[0].limit'),
				offset: _.get(keys, '[0].offset'),
				filter: _.get(keys, '[0].filter'),
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

	services: new Dataloader(async (ids) => {
		const services = await getServicesByIds({ ids });
		const byIds = new Map(services.map((service) => [service.id, service]));

		return ids.map((id) => byIds.get(id));
	}),
});
