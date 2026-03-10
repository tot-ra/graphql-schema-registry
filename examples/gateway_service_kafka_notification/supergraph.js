const { getServiceListWithTypeDefs } = require('./poll-schema-registry');
const { composeServices } = require('@apollo/composition');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6004');
const schemaUpdatesChannel =
	process.env.REDIS_SCHEMA_UPDATES_CHANNEL || 'graphql-schema-updates';

const defaultService = {
	name: 'default',
	version: '1.0',
	url: 'http://localhost:8080/graphql',
	typeDefs: 'type Query { default: String }',
};

class CustomSupergraphManager {
	constructor() {
		const that = this;
		redis.on('message', async (channel, message) => {
			if (channel !== schemaUpdatesChannel) {
				return;
			}

			console.log('Received schema update event', message);
			const supergraphSdl = await that.buildSupergraph();
			that.update(supergraphSdl);
		});
		redis.subscribe(schemaUpdatesChannel).then(() => {
			console.log(`Subscribed to redis channel ${schemaUpdatesChannel}`);
		});
	}

	async initialize({ update }) {
		this.update = update;
		const supergraphSdl = await this.buildSupergraph();

		return {
			supergraphSdl,
		};
	}

	async buildSupergraph() {
		let services = await getServiceListWithTypeDefs();

		if (!services || services.length === 0) {
			services = [defaultService];
		}

		return compose(services);
	}
}

function compose(services) {
	const composed = composeServices(services);

	if (composed.errors) {
		console.error('there were errors composing the supergraph');
		throw Error(composed.errors.map((e) => `\t${e.message}`).join('\n'));
	}

	return composed.supergraphSdl;
}

module.exports = CustomSupergraphManager;
