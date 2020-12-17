module.exports = {
	//override me
	formatCommitLink: (serviceName, hash) =>
		`https://github.com/MY_ORGANIZATION/${serviceName}/commit/${hash}`,

	serviceDiscovery: {
		'gql-schema-registry-db': {
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
	},
};
