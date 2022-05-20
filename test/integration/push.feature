Feature: As a customer
	I would like to push a new schema to the supergraph

	Scenario: I request to push a new schema
		When I send a "POST" request to "/schema/push" with body:
		"""
		{
		  "name": "test",
		  "version": "latest",
		  "type_defs": "type Query { hello: String }",
		  "url": "http://127.0.0.1:4000/api/graphql/test"
		}
		"""
		Then the database must contain an operation named "hello"
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
				"type_defs": "type Query { hello: String }",
				"is_active": 1
			}
		}
		"""
