const config = require('./config');

module.exports = {
	getServiceInstance: (name) => {
		if (!config.serviceDiscovery[name]) {
			throw new Error(`undefined service ${name} networkaddress`);
		}
		return config.serviceDiscovery[name];
	},
};
