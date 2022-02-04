const knex = require('knex');
const request = require('request-promise');

let db;

async function waitUntilDbIsReadyOr20Sec() {
	for (const i = 0; i < 20; i++) {
		if (await db.schema.hasTable('persisted_queries')) {
			return true;
		}
		console.log('Waiting for DB to be ready ...');
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
}

async function waitUntilServiceIsReadyOr20Sec() {
	for (const i = 0; i < 10; i++) {
		let result = await request({
			method: 'GET',
			uri: 'http://localhost:6001/health',
			resolveWithFullResponse: true,
			json: true,
		});

		if (result.statusCode === 200) {
			return true;
		}
		console.log('Waiting for service to be ready ...');
		await new Promise((resolve) => setTimeout(resolve, 2000));
	}
}

module.exports = {
	db,
	waitUntilServiceIsReadyOr20Sec,
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

		await waitUntilDbIsReadyOr20Sec();
	},

	reset: async () => {
		await db('persisted_queries').truncate();
		await db('container_schema').truncate();
		await db('services').delete();
		await db('schema').delete();
	},

	disconnect: async () => {
		await db.destroy();
	},
};
