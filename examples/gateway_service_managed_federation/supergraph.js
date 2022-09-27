const { getServiceListWithTypeDefs } = require('./poll-schema-registry');
const { composeServices } = require('@apollo/composition');

const State = {
	Initialized: { phase: 'initialized' },
	Polling: { phase: 'polling' },
	Stopped: { phase: 'stopped' },
};

const defaultService = {
	name: 'default',
	version: '1.0',
	url: 'http://localhost:8080/graphql',
	typeDefs: 'type Query { default: String }',
};

class CustomSupergraphManager {
	constructor(options) {
		if (options) {
			if ('pollIntervalInMs' in options) {
				this.pollIntervalInMs = options.pollIntervalInMs;
			}
		}
		this.serviceSdlCache = new Map();
		this.state = State.Initialized;
	}

	async initialize({ update }) {
		this.update = update;
		const { supergraphSdl } = await this.buildSupergraph();

		if (this.pollIntervalInMs) {
			this.beginPolling();
		}

		return {
			supergraphSdl,
			cleanup: async () => {
				this.state = State.Stopped;
				if (this.timerRef) {
					clearTimeout(this.timerRef);
					this.timerRef = null;
				}
			},
		};
	}

	async buildSupergraph() {
		let { services, schemaChanged } = await getServiceListWithTypeDefs(
			this.serviceSdlCache
		);

		if (!services || services.length === 0) {
			services = [defaultService];
		}

		return { supergraphSdl: compose(services), schemaChanged };
	}

	beginPolling() {
		this.state = State.Polling;
		this.poll();
	}

	poll() {
		this.timerRef = setTimeout(async () => {
			if (this.state === State.Polling) {
				console.info('polling schema registry...');
				const { supergraphSdl, schemaChanged } =
					await this.buildSupergraph();

				console.info('polling done');

				if (schemaChanged) {
					console.info('updating supergraph');
					this.update(supergraphSdl);
				} else {
					console.info('no supergraph update');
				}
			}

			this.poll();
		}, this.pollIntervalInMs);
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
