const { get } = require('lodash');
const request = require('request-promise-native');

exports.getServiceListWithTypeDefs = async () => {
	// make this list dynamic to update version on-the-fly depending on containers
	const services = [
		{
			name: 'service_a',
			version: 'v1', // use docker hash of the containers
		},

		{
			name: 'service_b',
			version: 'v1',
		},
	];

	const serviceTypeDefinitions = await request({
		baseUrl: 'http://localhost:6001',
		method: 'POST',

		// Better approach to provide versions of services you have running in production
		// instead of using just /schema/latest
		url: '/schema/compose',
		json: true,
	});

	return get(serviceTypeDefinitions, 'data', []).map((schema) => {
		const service = services.find(
			(service) => service.name === schema.name
		);

		if (!service) {
			console.warn(
				`Matching service not found for type definition "${schema.name}"`
			);
		} else {
			console.log(
				`Got ${schema.name} service schema with version ${schema.version}`
			);
		}
		return {
			name: schema.name,
			// note that URLs are used based on service name, utilizing docker internal network
			url: `dynamic://${schema.name}`,
			version: schema.version,
			typeDefs: schema.type_defs,
			typeDefsOriginal: schema.type_defs_original,
			...(service ? service : {}),
		};
	});
};
