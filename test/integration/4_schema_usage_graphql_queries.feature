Feature: As a customer
	I would like to get usage data from the supergraph

	Scenario: I request the usage of an operation in the last month
		Given the database is imported from 'schema_usage'
		And a client named "local-test-microservice" with version "1.3.0" makes 100 "valid" queries:
			"""
			query SofianeTest($platform: Platform!) {
			  proBrands(platform: $platform) {
			    logo
			  }
			}
			"""
		And a client named "local-test-microservice" with version "1.3.0" makes 50 "invalid" queries:
			"""
			query SofianeTest($platform: Platform!) {
			  proBrands(platform: $platform) {
			    logo
			  }
			}
			"""
		And a client named "local-test-microservice" with version "1.2.3" makes 400 "valid" queries:
			"""
			query SofianeTest($platform: Platform!) {
			  proBrands(platform: $platform) {
			    logo
			  }
			}
			"""
		And a client named "local-test-microservice" with version "1.2.3" makes 100 "invalid" queries:
			"""
			query SofianeTest($platform: Platform!) {
			  proBrands(platform: $platform) {
			    logo
			  }
			}
			"""
		When I execute the graphQL query in file "getRootFieldUsageStats.graphql" with variables:
			"""
			{
				"id": 18,
				"startDate": "2022-05-01T00:00:00Z",
				"endDate": "2030-05-31T23:59:59Z"
			}
			"""
		Then the response contains no errors
		And the response contains JSON from file "getRootFieldUsageStats.json"

	Scenario: I request the usage of an operation in a specific time period
		Given the database is imported from 'schema_usage'
		And the redis contains the keys:
			| root_field_18_0000000000_12_SofianeTest_success               | 400 |
			| root_field_18_0000000000_12_SofianeTest_error                 | 100 |
			| root_field_18_{{DATE_NOW_PLACEHOLDER}}_66_SofianeTest_success | 100 |
			| root_field_18_{{DATE_NOW_PLACEHOLDER}}_66_SofianeTest_error   | 50  |
		When I execute the graphQL query in file "getRootFieldUsageStats.graphql" with variables:
			"""
			{
				"id": 18,
				"startDate": "2022-05-27T11:20:00Z",
				"endDate": "2030-05-27T12:20:00Z"
			}
			"""
		Then the response contains no errors
		And the response contains JSON from file "getRootFieldUsageStatsTimePeriod.json"

	Scenario: I request the usage of an operation with no usage record
		Given the database is imported from 'schema_usage'
		When I execute the graphQL query in file "getRootFieldUsageStats.graphql" with variables:
			"""
			{
				"id": 20,
				"startDate": "2022-05-01T00:00:00Z",
				"endDate": "2022-05-31T23:59:59Z"
			}
			"""
		Then the response contains no errors
		And the response contains JSON from file "getRootFieldUsageStatsEmpty.json"

	Scenario: I request the usage of an object in the last month
		Given the database is imported from 'schema_usage'
		And the redis contains the keys:
			| e_12_h45h1_1653652800 | 100 |
			| s_12_h45h1_1653652900 | 400 |
			| e_66_h45h2_1653653000 | 50  |
			| s_66_h45h2_1653653100 | 100 |
		And the redis has the key 'o_12_h45h1' with value as in file 'o_12_h45h1-content.json'
		And the redis has the key 'o_66_h45h2' with value as in file 'o_66_h45h2-content.json'
		When I execute the graphQL query in file "getFieldUsageTrack.graphql" with variables:
			"""
			{
				"id": 99,
				"startDate": "2022-05-01T00:00:00Z",
				"endDate": "2022-05-31T23:59:59Z"
			}
			"""
		Then the response contains no errors
		And the response contains JSON from file "getFieldUsageTrack.json"

	Scenario: I request the usage of an object with no usage record
		Given the database is imported from 'schema_usage'
		When I execute the graphQL query in file "getFieldUsageTrack.graphql" with variables:
			"""
			{
				"id": 99,
				"startDate": "2022-05-01T00:00:00Z",
				"endDate": "2022-05-31T23:59:59Z"
			}
			"""
		Then the response contains no errors
		And the response contains JSON from file "getFieldUsageTrackEmpty.json"
