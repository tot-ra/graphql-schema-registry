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
			clientId:
				process.env.KAFKA_CLIENT || 'graphql-schema-registry-server',
			brokers: process.env.KAFKA_BROKERS
				? process.env.KAFKA_BROKERS.split(',')
				: ['gql-schema-registry-kafka:9092'],
			topic: process.env.KAFKA_TOPIC || 'test-topic',
		},
	},
	asyncSchemaUpdates: Boolean(process.env.ASYNC_SCHEMA_UPDATES || 'false'),
};
