module.exports = {
	//override me
	formatCommitLink: (serviceName, hash) =>
		`https://github.com/MY_ORGANIZATION/${serviceName}/commit/${hash}`,

	serviceDiscovery: {
		'gql-schema-registry-db': {
			host: 'gql-schema-registry-db',
			port: '3306',
			username: 'root',
			secret: 'root',
		},
		'gql-schema-registry-redis': {
			host: 'gql-schema-registry-redis',
			port: '6379',
			username: '',
			secret: '',
		},
	},
};
