const knex = require('knex');
let db;

module.exports = {
	db,
	connect: async () => {
		db = knex({
			client: 'mysql2',
			log: {
				warn: console.info,
				error: console.error,
				deprecate: console.info,
				debug: console.debug,
			},
			connection: async () => {
				return {
					host: 'localhost',
					port: '6000',
					user: 'root',
					password: 'root',
					database: 'schema_registry',
					connectTimeout: 2000,
					expirationChecker: () => true,
					multipleStatements: true,
				};
			},
		});
	},

	reset: async () => {
		await Promise.all([
			db('persisted_queries').truncate(),
			db('container_schema').truncate(),
		]);

		await Promise.all([db('services').delete(), db('schema').delete()]);
	},

	disconnect: async () => {
		await db.destroy();
	},
};
