var request = require("request-promise-native");
const { buildFederatedSchema, printSchema } = require("@apollo/federation");
const { ApolloServer, gql } = require("apollo-server-express");
const express = require("express");
const app = express();
const { json } = require("body-parser");

const typeDefs = gql`
	type Query {
		hello: String
	}
`;

const resolvers = {
	Query: {
		hello: () => "world"
	}
};

const server = new ApolloServer({
	schema: buildFederatedSchema([{ typeDefs, resolvers }])
});

const router = express.Router();
app.use(router);
router.use(json());
server.applyMiddleware({ app });

app.listen({ port: 6101 }, () => {
	console.log(`🚀 Server ready at http://localhost:6101`);
});

// register schema
(async () => {
	try {
		await request({
			timeout: 5000,
			baseUrl: "http://localhost:6001", // graphql-schema-registry service URL
			url: "/schema/push",
			method: "POST",
			json: true,
			body: {
				name: "service_a", // service name
				version: "v1", //service version, like docker container hash. Use 'latest' for dev env
				type_defs: printSchema(typeDefs)
			}
		});
		console.info("Schema registered successfully!");
	} catch (err) {
		console.error(`Schema registration failed: ${err.message}`);
	}
})();
