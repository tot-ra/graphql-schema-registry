const { services, discovery } = require('./discovery');

const knex = require('knex')({
	client: 'mysql2',
	connection: async () => {
		const { host, port } = await discovery(services.mysql);

		return {
			host,
			port,
			user: 'root',
			password: 'root',
			database: 'schema_registry',
			pool: { min: 0, max: 30, acquireTimeoutMillis: 30 * 1000 },
		};
	},
});

export async function cleanTables() {
	await knex.raw('DELETE FROM `schema_hit`;');
	await knex.raw('DELETE FROM `clients_persisted_queries_rel`;');
	await knex.raw('DELETE FROM `clients`;');
	await knex.raw('DELETE FROM `container_schema`;');
	await knex.raw('DELETE FROM `schema`;');
	await knex.raw('DELETE FROM `services`;');
	await knex.raw('DELETE FROM `persisted_queries`;');
}

export default knex;
