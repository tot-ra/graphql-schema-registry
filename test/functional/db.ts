import { Knex } from 'knex';
import knex from 'knex';

export let connection: Knex;

export async function connect() {
	connection = knex({
		client: 'pg',
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
				user: 'postgres',
				password: 'postgres',
				database: 'schema_registry',
				connectTimeout: 2000,
				expirationChecker: () => true,
			};
		},
	});
}

export async function reset() {
	await connection.raw(`
		TRUNCATE TABLE
			clients_persisted_queries_rel,
			schema_hit,
			container_schema,
			"schema",
			services,
			clients,
			persisted_queries
		RESTART IDENTITY CASCADE;
	`);
}

export async function disconnect() {
	await connection.destroy();
}
