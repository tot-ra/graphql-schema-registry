Feature: As a customer
	I would like to get usage data from the supergraph

	Scenario: I request the usage of an operation in the last month
		Given the database is imported from 'schema_usage'
		And the redis contains the keys:
			| e_12_h45h1_1653652800 | 100 |
			| s_12_h45h1_1653652900 | 400 |
			| e_66_h45h2_1653653000 | 50  |
			| s_66_h45h2_1653653100 | 100 |
		And the redis has the key 'o_12_h45h1' with value as in file 'o_12_h45h1-content.json'
		And the redis has the key 'o_66_h45h2' with value as in file 'o_66_h45h2-content.json'
		When I execute the graphQL query in file "getOperationUsageTrack.graphql" with variables:
			"""
			{
				"id": 20,
				"startDate": "2022-05-01T00:00:00Z",
				"endDate": "2022-05-31T23:59:59Z"
			}
			"""
		Then the response contains no errors
		And the response contains JSON from file "getOperationUsageTrack.json"

	Scenario: I request the usage of an object in the last hour
		Given the database is imported from 'schema_usage'
		And the redis contains the keys:
			| e_12_h45h1_1653652800 | 100 |
			| s_12_h45h1_1653652800 | 400 |
			| e_66_h45h2_1653690000 | 50  |
			| s_66_h45h2_1653690000 | 100 |
		And the redis has the key 'o_12_h45h1' with value as in file 'o_12_h45h1-content.json'
		And the redis has the key 'o_66_h45h2' with value as in file 'o_66_h45h2-content.json'
		When I execute the graphQL query in file "getOperationUsageTrack.graphql" with variables:
			"""
			{
				"id": 20,
				"startDate": "2022-05-27T11:20:00Z",
				"endDate": "2022-05-27T12:20:00Z"
			}
			"""
		Then the response contains no errors
		And the response contains JSON from file "getOperationUsageTrackLastHour.json"
	
	Scenario: I request the usage of an operation with no usage record
		Given the database is imported from 'schema_usage'
		When I execute the graphQL query in file "getOperationUsageTrack.graphql" with variables:
			"""
			{
				"id": 20,
				"startDate": "2022-05-01T00:00:00Z",
				"endDate": "2022-05-31T23:59:59Z"
			}
			"""
		Then the response contains no errors
		And the response contains JSON from file "getOperationUsageTrackEmpty.json"

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
