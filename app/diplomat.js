module.exports = {
	getServiceInstance: (name) => {
		const address = {
			host: '',
			port: '',
			username: '',
			secret: '',
		};
		switch (name) {
			case 'gql-schema-registry-db':
				address.host = 'gql-schema-registry-db';
				address.port = '3306';
				address.username = 'root';
				address.secret = 'root';
				return address;

			case 'gql-schema-registry-redis':
				address.host = 'gql-schema-registry-redis';
				address.port = '6379';
				return address;
		}

		throw new Error(`undefined service ${name} networkaddress`);
	},
};
