@test
Feature: As a customer
	I would like to know the usage for the schemas in the supergraph

	Scenario: New client with an error on the query
		Given the database is imported from "schema_usage"
		When a client named "test" with version "0.0.1" makes 1 "invalid" queries:
			"""
			query IntegrationTest($platform: Platform!) {
			  proBrands(platform: $platform) {
			    logo
			  }
			}
			"""
		Then the redis must contain an "error" key for root field 18 with value 1

	Scenario: Recurrent client with an existing query with error
		Given the database is imported from "schema_usage"
		When a client named "test" with version "0.0.1" makes 2 "invalid" queries:
			"""
			query IntegrationTest($platform: Platform!) {
			  proBrands(platform: $platform) {
			    logo
			  }
			}
			"""
		Then the redis must contain an "error" key for root field 18 with value 2

	Scenario: Recurrent client with an existing query without errors
		Given the database is imported from "schema_usage"
		When a client named "test" with version "0.0.1" makes 1 "valid" queries:
			"""
			query IntegrationTest($platform: Platform!) {
			  proBrands(platform: $platform) {
			    logo
			  }
			}
			"""
		And a client named "test" with version "0.0.1" makes 2 "invalid" queries:
			"""
			query IntegrationTest($platform: Platform!) {
			  proBrands(platform: $platform) {
			    logo
			  }
			}
			"""
		Then the redis must contain an "error" key for root field 18 with value 2
		And the redis must contain an "success" key for root field 18 with value 1

	Scenario: Recurrent client with an existing query with no name
	Given the database is imported from "schema_usage"
		When a client named "test" with version "0.0.1" makes 1 "valid" queries:
			"""
			query IntegrationTest($platform: Platform!) {
			  proBrands(platform: $platform) {
			    logo
			  }
			}
			"""
		Then the redis must contain an "success" key for root field 18 with value 1
