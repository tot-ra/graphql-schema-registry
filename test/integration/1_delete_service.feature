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

	Scenario: I try to delete a service with security enabled but without a auth token
		Given I set the environment variable "SECURE_DELETE" to "true"
		Given I set the environment variable "DELETE_TOKEN" to "DELETE_TOKEN"
		When I send a "DELETE" request to "/service/test"
		Then the response status code should be 401

	Scenario: I try to delete a service with security enabled but with a wrong auth token
		Given I set the environment variable "SECURE_DELETE" to "true"
		Given I set the environment variable "DELETE_TOKEN" to "DELETE_TOKEN"
		When I send a "DELETE" request to "/service/test" with header "auth" set to "cat"
		Then the response status code should be 401

	Scenario: I delete a service with security enabled and a valid auth token
		Given I set the environment variable "SECURE_DELETE" to "true"
		Given I set the environment variable "DELETE_TOKEN" to "DELETE_TOKEN"
		When I send a "DELETE" request to "/service/test" with header "auth" set to "DELETE_TOKEN"
		Then the response status code should be 200
