import config from './config';

export default {
	getServiceInstance: (name) => {
		if (!config.serviceDiscovery[name]) {
			throw new Error(`undefined service ${name} networkaddress`);
		}
		return config.serviceDiscovery[name];
	},
};
