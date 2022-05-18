import { Kafka } from 'kafkajs';
import diplomat from '../diplomat';

const KAFKA_SCHEMA_REGISTRY =
	process.env.KAFKA_SCHEMA_REGISTRY || 'gql-schema-registry-kafka';

let producer = null;

export async function init() {
	const { host, port } = diplomat.getServiceInstance(KAFKA_SCHEMA_REGISTRY);

	const kafka = new Kafka({
		clientId: process.env.KAFKA_CLIENT || 'graphql-schema-registry-server',
		brokers: [`${host}:${port}`],
	});

	producer = kafka.producer();
	await producer.connect();
}

export function send(data) {
	if (!producer) {
		throw new Error('Kafka producer not initialized');
	}

	producer.send({
		topic: process.env.KAFKA_TOPIC || 'test-topic',
		messages: [{ value: JSON.stringify(data) }],
	});
}

exports.KAFKA_SCHEMA_REGISTRY = KAFKA_SCHEMA_REGISTRY;
