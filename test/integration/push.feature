Feature: As a customer
	I would like to push a new schema to the supergraph

	Scenario: I request to push a simple new schema
		When I send a "POST" request to "/schema/push" with body:
		"""
		{
		  "name": "test",
		  "version": "latest",
		  "type_defs": "type Query { fake: String }",
		  "url": "http://127.0.0.1:4000/api/graphql/test"
		}
		"""
		Then the database must contain an operation named "fake"
		And the database must contain a type "Scalar" named "String"
		And the response status code should be 200
		And the response should be in JSON and contain:
		"""
		{
			"success": true,
			"data": {
				"id": 2,
				"service_id": 3,
				"version": "latest",
				"name": "test",
				"url": "http://127.0.0.1:4000/api/graphql/test",
				"type_defs": "type Query { fake: String }",
				"is_active": 1
			}
		}
		"""

	Scenario: I request to push a more complex new schema
		When I send a "POST" request to "/schema/push" with body:
		"""
		{
		  "name": "test2",
		  "version": "latest",
		  "type_defs": "type Query { hello(world: String): String } enum TestEnum { E N U M } type Fake { integration: Int, tests: [String!] } scalar BigInteger",
		  "url": "http://127.0.0.1:4000/api/graphql/test2"
		}
		"""
		Then the database must contain an operation named "hello"
		And the database must contain some "Scalar" types as "String,BigInteger,Int"
		And the database must contain some "Object" types as "Fake"
		And the database must contain some "Enum" types as "TestEnum"
		And the database must contain some fields as "E,N,U,M,integration,tests"
		And the database must contain some query parameters as "world"
		And the database must contain 5 subgraph fields for service 4
		And the response status code should be 200
		And the response should be in JSON and contain:
		"""
		{
			"success": true,
			"data": {
				"id": 3,
				"service_id": 4,
				"version": "latest",
				"name": "test2",
				"url": "http://127.0.0.1:4000/api/graphql/test2",
				"type_defs": "type Query { hello(world: String): String } enum TestEnum { E N U M } type Fake { integration: Int, tests: [String!] } scalar BigInteger",
				"is_active": 1
			}
		}
		"""
