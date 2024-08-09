import 'reflect-metadata';
import { resolve } from 'path';
import { AfterAll, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import config from '../../../src/config';
import { getSeedFile } from './db-config';
import { extendExpect } from './customMatchers/toContainObject';
import expect from 'expect';
import fetch from 'node-fetch';
import { logger } from '../../../src/logger';
import { MySqlContainer } from '@testcontainers/mysql';

extendExpect(expect);

async function waitUntilServiceIsReadyOr5Min() {
	for (let i = 0; i < 300; i++) {
		try {
			const result = await fetch('http://localhost:3000/health');

			if (result.status === 200) {
				console.log('Service looks healthy');
				break;
			}
			// eslint-disable-next-line no-empty
		} catch (e) {}

		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
	return true;
}

const dataPath = resolve(__dirname, '..', 'data');
export const requestDataPath = resolve(dataPath, 'request');
export const responseDataPath = resolve(dataPath, 'response');
export const sqlDataPath = resolve(dataPath, 'sql');
export const redisDataPath = resolve(dataPath, 'redis');
export let apolloServer;
const containers: StartedTestContainer[] = [];

BeforeAll({ timeout: 60000 * 1000 }, async () => {
	console.log('Starting Tests...');

	setDefaultTimeout(20 * 1000);
	const dbContainer = await new MySqlContainer()
		.withUsername('gql-schema-registry-db')
		.withDatabase('schema_registry')
		.withCopyContentToContainer([
			{
				content: getSeedFile(),
				target: '/docker-entrypoint-initdb.d/create_tables.sql',
			},
		])
		.withExposedPorts(3306)
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
	await waitUntilServiceIsReadyOr5Min();
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
