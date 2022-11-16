const services = {
	app: 'schema-registry',
	mysql: 'schema-registry-dbtest',
	redis: 'schema-registry-api-test-redis',
};

exports.services = services;

exports.discovery = async (app) => {
	switch (app) {
		case services.app:
			return {
				host: 'localhost',
				port: 6001,
			};
		case services.mysql:
			return {
				host: 'localhost',
				port: 6000,
			};
	}
};
