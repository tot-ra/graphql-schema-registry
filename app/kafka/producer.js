const { Kafka } = require('kafkajs');
const diplomat = require('../diplomat');

const KAFKA_SCHEMA_REGISTRY =
	process.env.KAFKA_SCHEMA_REGISTRY || 'gql-schema-registry-kafka';

const { clientId, brokers } = diplomat.getServiceInstance(
	KAFKA_SCHEMA_REGISTRY
);

const kafka = new Kafka({
	clientId,
	brokers,
});

const producer = kafka.producer();
const run = async () => {
	// Producing
	await producer.connect();
	return producer;
};

// run().catch(console.error)
exports.producer = run;
exports.KAFKA_SCHEMA_REGISTRY = KAFKA_SCHEMA_REGISTRY;
