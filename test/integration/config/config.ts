import 'reflect-metadata';
import { resolve } from 'path';
import { AfterAll, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import config from '../../../src/config';
import { getSeedFile } from './db-config';
import { extendExpect } from './customMatchers/toContainObject';
import expect from 'expect';
import { getServer } from '../../../src/graphql';
import { logger } from '../../../src/logger';

extendExpect(expect);

const dataPath = resolve(__dirname, '..', 'data');
export const requestDataPath = resolve(dataPath, 'request');
export const responseDataPath = resolve(dataPath, 'response');
export const sqlDataPath = resolve(dataPath, 'sql');
export const redisDataPath = resolve(dataPath, 'redis');
export let apolloServer;
let containers: StartedTestContainer[] = [];

BeforeAll({ timeout: 60000 * 1000 }, async () => {
	console.log('Starting Tests...');

	setDefaultTimeout(20 * 1000);
	const dbContainer = await new GenericContainer('mysql:8.0')
		.withExposedPorts(3306)
		.withEnvironment({
			SERVICE_3306_NAME: 'gql-schema-registry-db',
			MYSQL_ROOT_PASSWORD: 'root',
			MYSQL_DATABASE: 'schema_registry',
		})
		.withCopyContentToContainer([
			{
				content: getSeedFile(),
				target: '/docker-entrypoint-initdb.d/create_tables.sql',
			},
		])
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
	const { getServer } = await import('../../../src/graphql/index');
	apolloServer = getServer();
});

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

AfterAll(async () => {
	const { stop } = await import('../../../src');
	await stop();

	try {
		logger.info('Stopping containers...');
		await Promise.all(containers.map((container) => container.stop()));
	} catch (error) {
		logger.info('Issues stopping containers');
	}

	logger.info('Server shutdown complete. Exiting process.');
	setTimeout(() => {
		process.exit(0);
	}, 500);
});
