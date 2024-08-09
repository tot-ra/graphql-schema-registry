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

    @supergraph
	Scenario: I request the supergraph
		Given the database is imported from 'breakdown_schema_db'
		When I execute the graphQL query in file "getRouterConfig.graphql" with variables:
        """
        {
        }
        """
		Then the response contains no errors
        And the response contains JSON from file "getRouterConfig.json"

	@supergraph
	Scenario: I request the supergraph
		Given the database is imported from 'breakdown_schema_db'
		When I execute the graphQL query in file "getRouterConfig.graphql" with variables:
        """
        {
        	"ifAfterId": "c37915"
        }
        """
		Then the response contains no errors
		And the response contains JSON from file "getRouterConfigUnchanged.json"


	@supergraph
	Scenario: I request the supergraph
		Given the database is imported from 'breakdown_schema_db'
		When I execute the graphQL query in file "getServices.graphql" with variables:
        """
        {
        	"limit": 10,
        	"offset": 0,
        	"order" : "DESC",
        	"sortField" : "NAME"

        }
        """
		Then the response contains no errors
		And the response contains JSON from file "getServices.json"

	Scenario: I request a paginated list of object instances in the supergraph
		Given the database is imported from 'breakdown_schema_db'
		When I execute the graphQL query in file "getListTypeInstances.graphql" with variables:
        """
        {
            "type": "Object",
            "limit": 10,
            "offset": 10,
            "order" : "DESC"
        }
        """
		Then the response contains no errors
		And the response contains JSON from file "getListTypeInstancesSorted.json"

    @supergraph
	Scenario: I request the entitlements
		Given the database is imported from 'breakdown_schema_db'
		When I execute the graphQL query in file "getEntitlement.graphql" with variables:
        """
        {
            "apiKey": "1",
            "graph_ref": "1"
        }
        """
		Then the response contains no errors
        And the response contains JSON from file "getEntitlement.json"

    @supergraph
	Scenario: I request the entitlements with no change
		Given the database is imported from 'breakdown_schema_db'
		When I execute the graphQL query in file "getEntitlement.graphql" with variables:
        """
        {
            "apiKey": "1",
            "graph_ref": "1",
            "ifAfterId": "new"
        }
        """
		Then the response contains no errors
        And the response contains JSON from file "getEntitlementNotChanged.json"
