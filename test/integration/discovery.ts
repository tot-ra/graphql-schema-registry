const services = {
	app: 'schema-registry',
	db: 'schema-registry-dbtest',
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
		case services.db:
			return {
				host: 'localhost',
				port: 6000,
			};
	}
};
