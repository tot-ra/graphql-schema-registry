const { getServiceListWithTypeDefs } = require('./poll-schema-registry');
const { composeServices } = require('@apollo/composition');
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
	clientId: 'graphql-schema-registry-client',
	brokers: ['localhost:29092'],
});

const consumer = kafka.consumer({ groupId: 'test-group' });

const defaultService = {
	name: 'default',
	version: '1.0',
	url: 'http://localhost:8080/graphql',
	typeDefs: 'type Query { default: String }',
};

class CustomSupergraphManager {
	constructor() {
		this.consumer = null;
		const that = this;
		consumer.connect().then(async () => {
			await consumer.subscribe({
				topic: 'graphql-schema-updates',
				fromBeginning: true,
			});
			await consumer.run({
				eachMessage: async ({ topic, partition, message }) => {
					console.log({
						partition,
						offset: message.offset,
						value: message.value.toString(),
					});
					const supergraphSdl = await that.buildSupergraph();

					that.update(supergraphSdl);
				},
			});
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
