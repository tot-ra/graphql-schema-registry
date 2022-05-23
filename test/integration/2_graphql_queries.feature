Feature: As a customer
	I would like to get data from the supergraph

	Scenario: I request a list of all the types and operations in the supergraph
        Given the database is imported from 'breakdown_schema_db'
        When I execute the graphql query 'listTypesQuery.graphql'
        Then I should get the payload 'listTypesQuery.json'
        