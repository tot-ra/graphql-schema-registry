Feature: As a customer
	I would like to know the usage for the schemas in the supergraph

	Scenario: New client with an error on the query
		Given a not registered client "test" and version "0.0.1" for an "invalid" query:
		"""
		# IntegrationTest
		query IntegrationTest($platform: Platform!) {
			proBrands(platform: $platform) {
				logo
			  }
		}
		"""
		Then the database must contain a client with name "test" and version "0.0.1"
		And the redis must contain 3 entries for client 1
		And 1 error registered for client 1
		And 0 success registered for client 1

	Scenario: Recurrent client with an existing query with error
		Given a registered client 1 for an "invalid" query:
		"""
		# IntegrationTest
		query IntegrationTest($platform: Platform!) {
			proBrands(platform: $platform) {
				logo
			  }
		}
		"""
		Then the database must contain a client with name "test" and version "0.0.1"
		And the redis must contain 3 entries for client 1
		And 2 error registered for client 1
		And 0 success registered for client 1

	Scenario: Recurrent client with an existing query without errors
		Given a registered client 1 for an "valid" query:
		"""
		# IntegrationTest
		query IntegrationTest($platform: Platform!) {
			proBrands(platform: $platform) {
				logo
			  }
		}
		"""
		Then the database must contain a client with name "test" and version "0.0.1"
		And the redis must contain 3 entries for client 1
		And 2 error registered for client 1
		And 1 success registered for client 1
