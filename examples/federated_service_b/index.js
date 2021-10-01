var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema, printSchema } = require('graphql');
var request = require('request-promise-native');

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    world: String
  }
`);

// The root provides a resolver function for each API endpoint
var root = {
	world: () => {
		return 'World!';
	},
};

var app = express();
app.use(
	'/graphql',
	graphqlHTTP({
		schema: schema,
		rootValue: root,
		graphiql: true,
	})
);
app.listen(6102);
console.log('Running a GraphQL API server at http://localhost:6102/graphql');

(async () => {
	try {
		await request({
			timeout: 5000,
			baseUrl: 'http://localhost:6001', // graphql-schema-registry service URL
			url: '/schema/push',
			method: 'POST',
			json: true,
			body: {
				name: 'service_b', // service name
				version: 'v1', //service version, like docker container hash. Use 'latest' for dev env
				type_defs: printSchema(schema),
				url: 'http://localhost:6102',
			},
		});
		console.info('Schema registered successfully!');
	} catch (err) {
		console.error(`Schema registration failed: ${err.message}`);
	}
})();
