import Knex from 'knex';
import knex from 'knex';

export let connection: Knex;

export async function connect() {
	connection = knex({
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
}

export async function reset() {
	await connection('persisted_queries').truncate();
	await connection('container_schema').truncate();
	await connection('services').delete();
	await connection('schema').delete();
}

export async function disconnect() {
	await connection.destroy();
}
