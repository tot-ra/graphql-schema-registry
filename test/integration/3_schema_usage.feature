Feature: As a customer
	I would like to know the usage for the schemas in the supergraph

	Scenario:
		Given a trace on "/api/ingress/traces" for client "test" and version "0.0.1" with schema:
		"""
		query IntegrationTest($world: String) {
			hello(world: $world)
		}
		"""
		Then the database must contain a client with name "test" and version "0.0.1"
		And the redis must contain 3 entries for client "test" and version "0.0.1"
