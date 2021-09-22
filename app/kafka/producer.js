const { Kafka } = require('kafkajs');

const kafka = new Kafka({
	clientId: 'graphql-schema-registry-server',
	brokers: ['gql-schema-registry-kafka:9092'],
});

const producer = kafka.producer();
const run = async () => {
	// Producing
	await producer.connect();
	await producer.send({
		topic: 'test-topic',
		messages: [{ value: 'Hello KafkaJS user!' }],
	});
	return producer;
};

// run().catch(console.error)
exports.producer = run;
