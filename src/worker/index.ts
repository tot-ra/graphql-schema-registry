const analyzeQueries = require('./analyzeQueries');

export default async function() {
	await analyzeQueries.start();
}
