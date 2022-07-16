import { Consumer, Kafka } from 'kafkajs';
import diplomat from '../diplomat';

const KAFKA_SCHEMA_REGISTRY =
	process.env.KAFKA_SCHEMA_REGISTRY || 'gql-schema-registry-kafka';

let producer = null;
let consumer = null;

export async function init() {
	const { host, port } = diplomat.getServiceInstance(KAFKA_SCHEMA_REGISTRY);

	const kafka = new Kafka({
		clientId: process.env.KAFKA_CLIENT || 'graphql-schema-registry-server',
		brokers: [`${host}:${port}`],
	});

	producer = kafka.producer();
	await producer.connect();
}

export async function initConsumer(): Promise<Consumer> {
	const { host, port } = diplomat.getServiceInstance(KAFKA_SCHEMA_REGISTRY);

	const kafka = new Kafka({
		clientId: process.env.KAFKA_CLIENT || 'graphql-schema-registry-server',
		brokers: [`${host}:${port}`],
	});

	consumer = kafka.consumer({
		groupId: 'graphql-schema-registry-worker',
	});
	await consumer.connect();

	return consumer;
}

export function send(data) {
	if (!producer) {
		throw new Error('Kafka producer not initialized');
	}

	producer.send({
		topic: process.env.KAFKA_SCHEMA_TOPIC || 'graphql-schema-updates',
		messages: [{ value: JSON.stringify(data) }],
	});
}

exports.KAFKA_SCHEMA_REGISTRY = KAFKA_SCHEMA_REGISTRY;
