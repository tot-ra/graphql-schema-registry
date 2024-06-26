export default {
	port: process.env.PORT || '3000',

	// override me
	formatCommitLink: (serviceName, hash) =>
		`https://github.com/MY_ORGANIZATION/${serviceName}/commit/${hash}`,

	serviceDiscovery: {
		'gql-schema-registry-db': {
			client: 'mysql2', // needed for knex migrate:make to not use sqlite3
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
			db: intFor(process.env.REDIS_DB, '2'),
		},
		'gql-schema-registry-kafka': {
			host: process.env.KAFKA_BROKER_HOST || 'gql-schema-registry-kafka',
			port: process.env.KAFKA_BROKER_PORT || '9092',
		},
	},
	asyncSchemaUpdates: booleanFor(process.env.ASYNC_SCHEMA_UPDATES),
	logStreamingEnabled:
		booleanFor(process.env.LOG_STREAMING_ENABLED, 'true') &&
		process.env.REDIS_HOST !== undefined,
};

function booleanFor(variable, defaultValue = 'false') {
	return (variable || defaultValue).toLowerCase() === 'true';
}

function intFor(variable, defaultValue = '0') {
	const parsed = parseInt(variable || defaultValue);
	if (isNaN(parsed)) {
		return parseInt(defaultValue);
	}
	return parsed;
}
