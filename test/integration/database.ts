const { services, discovery } = require('./discovery');

const knex = require('knex')({
	client: 'pg',
	connection: async () => {
		const { host, port } = await discovery(services.db);

		return {
			host,
			port,
			user: 'postgres',
			password: 'postgres',
			database: 'schema_registry',
			pool: { min: 0, max: 30, acquireTimeoutMillis: 30 * 1000 },
		};
	},
});

export async function cleanTables() {
	await knex('schema_hit').delete();
	await knex('clients_persisted_queries_rel').delete();
	await knex('clients').delete();
	await knex('container_schema').delete();
	await knex('schema').delete();
	await knex('services').delete();
	await knex('persisted_queries').delete();
}

export default knex;
