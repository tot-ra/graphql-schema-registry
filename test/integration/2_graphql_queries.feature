Feature: As a customer
	I would like to get data from the supergraph

	Scenario: I request a list of all the types and operations in the supergraph
        Given the database is imported from 'breakdown_schema_db'
        When I execute the graphQL query in file "listTypesQuery.graphql"
        Then the response contains no errors
        And the response contains JSON from file "listTypesQuery.json"

    Scenario: I request a paginated list of object instances in the supergraph
        Given the database is imported from 'breakdown_schema_db'
        When I execute the graphQL query in file "getListTypeInstances.graphql" with variables:
        """
        {
            "type": "Object",
            "limit": 10,
            "offset": 10
        }
        """
        Then the response contains no errors
        And the response contains JSON from file "getListTypeInstances.json"

        Scenario: I request a paginated list of object instances with a wrong type variable
        Given the database is imported from 'breakdown_schema_db'
        When I execute the graphQL query in file "getListTypeInstances.graphql" with variables:
        """
        {
            "type": "objeto",
            "limit": 10,
            "offset": 10
        }
        """
        Then the response contains "BAD_USER_INPUT" error

    Scenario: I request the detail of an instance
        Given the database is imported from 'breakdown_schema_db'
        When I execute the graphQL query in file "queryTypeInstanceDetail.graphql" with variables:
        """
        {
            "type": "object",
            "id": 27
        }
        """
        Then the response contains no errors
        And the response contains JSON from file "queryTypeInstanceDetail.json"

    Scenario: I request the detail of an instance with a wrong type variable
        Given the database is imported from 'breakdown_schema_db'
        When I execute the graphQL query in file "queryTypeInstanceDetail.graphql" with variables:
        """
        {
            "type": "objecte",
            "id": 27
        }
        """
        Then the response contains "BAD_USER_INPUT" error
