@test
Feature: As a customer
	I would like to get usage data from the supergraph

	Scenario: I request the usage of a root field
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
				"rootFieldId": 18,
				"startDate": "2022-05-01T00:00:00Z",
				"endDate": "2030-05-31T23:59:59Z"
			}
			"""
		Then the response contains no errors
		And the response contains JSON from file "getRootFieldUsageStats.json"

	Scenario: I request the usage of a root field in a specific time period
		Given the database is imported from 'schema_usage'
		And the redis contains the keys:
			| root_field_18_0000000000_12_SofianeTest_success               | 400 |
			| root_field_18_0000000000_12_SofianeTest_error                 | 100 |
			| root_field_18_{{DATE_NOW_PLACEHOLDER}}_66_SofianeTest_success | 100 |
			| root_field_18_{{DATE_NOW_PLACEHOLDER}}_66_SofianeTest_error   | 50  |
		When I execute the graphQL query in file "getRootFieldUsageStats.graphql" with variables:
			"""
			{
				"rootFieldId": 18,
				"startDate": "2022-05-27T11:20:00Z",
				"endDate": "2030-05-27T12:20:00Z"
			}
			"""
		Then the response contains no errors
		And the response contains JSON from file "getRootFieldUsageStatsTimePeriod.json"

	Scenario: I request the usage of a root field with no usage record
		Given the database is imported from 'schema_usage'
		When I execute the graphQL query in file "getRootFieldUsageStats.graphql" with variables:
			"""
			{
				"rootFieldId": 20,
				"startDate": "2022-05-01T00:00:00Z",
				"endDate": "2022-05-31T23:59:59Z"
			}
			"""
		Then the response contains no errors
		And the response contains JSON from file "getRootFieldUsageStatsEmpty.json"

	Scenario: I request the usage of an object
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
		When I execute the graphQL query in file "getFieldsUsageStats.graphql" with variables:
			"""
			{
				"parentTypeId": 16,
				"startDate": "2022-05-01T00:00:00Z",
				"endDate": "2030-05-31T23:59:59Z"
			}
			"""
		Then the response contains no errors
		And the response contains JSON from file "getFieldsUsageStats.json"

	Scenario: I request the usage of an object with no usage record
		Given the database is imported from 'schema_usage'
		When I execute the graphQL query in file "getFieldsUsageStats.graphql" with variables:
			"""
			{
				"parentTypeId": 99,
				"startDate": "2022-05-01T00:00:00Z",
				"endDate": "2022-05-31T23:59:59Z"
			}
			"""
		Then the response contains no errors
		And the response contains JSON from file "getFieldsUsageStatsEmpty.json"

	Scenario: I request the usage of an object in a specific time period
		Given the database is imported from 'schema_usage'
		And the redis contains the keys:
			| field_18_0000000000_f19_12_success               | 400 |
			| field_18_0000000000_f19_12_error                 | 100 |
			| field_18_{{DATE_NOW_PLACEHOLDER}}_f19_66_success | 100 |
			| field_18_{{DATE_NOW_PLACEHOLDER}}_f19_66_error   | 50  |
		When I execute the graphQL query in file "getFieldsUsageStats.graphql" with variables:
			"""
			{
				"parentTypeId": 18,
				"startDate": "2022-05-27T11:20:00Z",
				"endDate": "2030-05-27T12:20:00Z"
			}
			"""
		Then the response contains no errors
		And the response contains JSON from file "getFieldsUsageStatsTimePeriod.json"
