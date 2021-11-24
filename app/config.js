module.exports = {
	port: process.env.PORT || '3000',

	//override me
	formatCommitLink: (serviceName, hash) =>
		`https://github.com/MY_ORGANIZATION/${serviceName}/commit/${hash}`,

	serviceDiscovery: {
		'gql-schema-registry-db': {
			client: 'mysql2',
			host: process.env.DB_HOST || 'gql-schema-registry-db',
			port: process.env.DB_PORT || '3306',
			username: process.env.DB_USERNAME || 'root',
			secret: process.env.DB_SECRET || 'root',
			name: process.env.DB_NAME || 'schema_registry',
		},
		'gql-schema-registry-redis': {
			host: process.env.REDIS_HOST || 'gql-schema-registry-redis',
			port: process.env.REDIS_PORT || '6379',
			secret: process.env.REDIS_SECRET || '',
		},
		'gql-schema-registry-kafka': {
			host: process.env.KAFKA_BROKER_HOST || 'gql-schema-registry-kafka',
			port: process.env.KAFKA_BROKER_PORT || '9092',
		},
	},
	asyncSchemaUpdates: booleanFor(process.env.ASYNC_SCHEMA_UPDATES),
};

function booleanFor(variable) {
	return (variable || 'false').toLowerCase() === 'true';
}
