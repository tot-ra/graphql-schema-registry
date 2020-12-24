const diplomat = require('./app/diplomat')

const DB_SCHEMA_REGISTRY = process.env.DB_SCHEMA_REGISTRY || 'gql-schema-registry-db';
const {
	client,
	host,
	port,
	username,
	secret,
	name,
} = diplomat.getServiceInstance(DB_SCHEMA_REGISTRY);

module.exports = {
	client: client,
	connection: {
		host: host,
		port: port,
		database: name,
		user: username,
		password: secret
	}
};
