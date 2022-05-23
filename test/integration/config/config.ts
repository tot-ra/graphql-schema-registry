import 'reflect-metadata';
import { AfterAll, BeforeAll } from '@cucumber/cucumber';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import config from '../../../src/config';
import { getSeedFile } from './db-config';

let containers: StartedTestContainer[] = [];

BeforeAll({ timeout: 60000 * 1000 }, async () => {
	const dbContainer = await new GenericContainer('mysql:8.0')
		.withExposedPorts(3306)
		.withEnv('SERVICE_3306_NAME', 'gql-schema-registry-db')
		.withEnv('MYSQL_ROOT_PASSWORD', 'root')
		.withEnv('MYSQL_DATABASE', 'schema_registry')
		.withCopyContentToContainer(
			getSeedFile(),
			'/docker-entrypoint-initdb.d/create_tables.sql'
		)
		.start();

	config.serviceDiscovery['gql-schema-registry-db'].port = dbContainer
		.getMappedPort(3306)
		.toString();
	config.serviceDiscovery['gql-schema-registry-db'].host =
		dbContainer.getHost();

	const redisContainer = await new GenericContainer('redis:6-alpine')
		.withExposedPorts(6379)
		.start();

	config.serviceDiscovery['gql-schema-registry-redis'].port = redisContainer
		.getMappedPort(6379)
		.toString();
	config.serviceDiscovery['gql-schema-registry-redis'].host =
		redisContainer.getHost();

	containers.push(dbContainer);
	containers.push(redisContainer);

	// Waiting to alter the user's password (see: on /test/integration/config/init.sql)
	await sleep(1500);
	const { warmup } = await import('../../../src/start');
	await warmup();
});

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

AfterAll(async () => {
	await Promise.all(containers.map((container) => container.stop()));
	const { stop } = await import('../../../src');
	await stop();
	setTimeout(() => process.exit(0), 500);
});
