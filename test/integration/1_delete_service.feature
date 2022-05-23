Feature: As a customer
	I would like to delete a service from the supergraph

	Scenario: I delete an invalid service
		When I send a "DELETE" request to "/service/fake"
		Then the response status code should be 200
		And the response should be in JSON and contain:
		"""
		{
			"success": false,
			"data": null
		}
		"""

	Scenario: I delete a valid service
		When I send a "DELETE" request to "/service/test"
		Then the database must not contain an operation named "fake"
		And the database must not contain some "Scalar" types as "Float"
		And the database must contain 0 subgraph fields for service 3
		And the response status code should be 200
		And the response should be in JSON and contain:
		"""
		{
			"success": true,
			"data": null
		}
		"""
