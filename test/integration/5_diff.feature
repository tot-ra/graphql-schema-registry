@chat
Feature: As a customer
	I would like to be able to diff between schemas

	Scenario: I request to diff the same stored schema
		Given the database is imported from 'breakdown_schema_db'
		When I send a "POST" request to "/schema/diff" with body:
		"""
		{
		  "name": "coupons",
		  "version": "newest",
		  "type_defs": "type Query { loyaltyCoupons(platform: Platform!): [Coupon] } type Coupon { code: ID!, value: Float!, creationDate: String!, expirationDate: String! } enum Platform { FR ES IT DE GB }"
		}
		"""
		Then the response status code should be 200
		And the response should be in JSON and contain:
		"""
		{
		  "success": true
		}
		"""

	Scenario: I request to diff an existing schema with modifications
		Given the database is imported from 'breakdown_schema_db'
		When I send a "POST" request to "/schema/diff" with body:
		"""
		{
		  "name": "coupons",
		  "version": "newest",
		  "type_defs": "type Query { loyaltyCoupons(platform: Platform!): [Coupon] } type Coupon { code: ID!, value: Float!, creationDate: String! } enum Platform { FR ES IT DE GB }"
		}
		"""
		Then the response status code should be 200
		And the response should be in JSON and contain:
		"""
		{
			"success": true,
			"data": [
				{
					"criticality": {
						"level": "BREAKING",
						"reason": "Removing a field is a breaking change. It is preferable to deprecate the field before removing it."
					},
					"type": "FIELD_REMOVED",
					"message": "Field 'expirationDate' was removed from object type 'Coupon'",
					"path": "Coupon.expirationDate",
					"isBreakingChange": false,
					"totalUsages": 0
				}
			]
		}
		"""

	Scenario: I request to diff an existing schema with modifications and is forbidden because exceeds usages
		Given the database is imported from 'breakdown_schema_db'
		And a client named "local-test-microservice" with version "1.3.0" makes 9 "valid" queries:
			"""
			query SofianeTest($platform: Platform!) {
			   loyaltyCoupons(platform: $platform) {
			     expirationDate
			   }
			}
			"""
		And a client named "local-test-microservice" with version "1.3.0" makes 2 "invalid" queries:
			"""
			query SofianeTest($platform: Platform!) {
			   loyaltyCoupons(platform: $platform) {
			     expirationDate
			   }
			}
			"""
		When I send a "POST" request to "/schema/diff" with body:
		"""
		{
		  "name": "coupons",
		  "version": "newest",
		  "type_defs": "type Query { loyaltyCoupons(platform: Platform!): [Coupon] } type Coupon { code: ID!, value: Float!, creationDate: String! } enum Platform { FR ES IT DE GB }"
		}
		"""
		Then the response status code should be 200
		And the response should be in JSON and contain:
		"""
		{
			"success": false,
			"data": [
				{
					"criticality": {
						"level": "BREAKING",
						"reason": "Removing a field is a breaking change. It is preferable to deprecate the field before removing it."
					},
					"type": "FIELD_REMOVED",
					"message": "Field 'expirationDate' was removed from object type 'Coupon'",
					"path": "Coupon.expirationDate",
					"isBreakingChange": true,
					"totalUsages": 11
				}
			]
		}
		"""

	Scenario: I request to diff an existing schema with modifications and is valid because not exceeds min_usages
		Given the database is imported from 'breakdown_schema_db'
		And a client named "local-test-microservice" with version "1.3.0" makes 9 "valid" queries:
			"""
			query SofianeTest($platform: Platform!) {
			   loyaltyCoupons(platform: $platform) {
			     expirationDate
			   }
			}
			"""
		And a client named "local-test-microservice" with version "1.3.0" makes 2 "invalid" queries:
			"""
			query SofianeTest($platform: Platform!) {
			   loyaltyCoupons(platform: $platform) {
			     expirationDate
			   }
			}
			"""
		When I send a "POST" request to "/schema/diff" with body:
		"""
		{
		  "name": "coupons",
		  "version": "newest",
		  "type_defs": "type Query { loyaltyCoupons(platform: Platform!): [Coupon] } type Coupon { code: ID!, value: Float!, creationDate: String! } enum Platform { FR ES IT DE GB }",
		  "min_usages": 20
		}
		"""
		Then the response status code should be 200
		And the response should be in JSON and contain:
		"""
		{
			"success": true,
			"data": [
				{
					"criticality": {
						"level": "BREAKING",
						"reason": "Removing a field is a breaking change. It is preferable to deprecate the field before removing it."
					},
					"type": "FIELD_REMOVED",
					"message": "Field 'expirationDate' was removed from object type 'Coupon'",
					"path": "Coupon.expirationDate",
					"isBreakingChange": false,
					"totalUsages": 11
				}
			]
		}
		"""

	@chien
	Scenario: I request to diff an existing schema with modifications and is valid because no usages on the days specified
		Given the database is imported from 'breakdown_schema_db'
		And the redis contains the keys:
			| field_62_0000000000_f106_12_success | 400 |
			| field_62_0000000000_f106_12_error   | 100 |
		When I send a "POST" request to "/schema/diff" with body:
		"""
		{
		  "name": "coupons",
		  "version": "newest",
		  "type_defs": "type Query { loyaltyCoupons(platform: Platform!): [Coupon] } type Coupon { code: ID!, value: Float!, creationDate: String! } enum Platform { FR ES IT DE GB }",
		  "usage_days": 5,
		  "min_usages": 5
		}
		"""
		Then the response status code should be 200
		And the response should be in JSON and contain:
		"""
		{
			"success": true,
			"data": [
				{
					"criticality": {
						"level": "BREAKING",
						"reason": "Removing a field is a breaking change. It is preferable to deprecate the field before removing it."
					},
					"type": "FIELD_REMOVED",
					"message": "Field 'expirationDate' was removed from object type 'Coupon'",
					"path": "Coupon.expirationDate",
					"isBreakingChange": false,
					"totalUsages": 0
				}
			]
		}
		"""

	Scenario: I request to diff an existing schema with query type modifications with breaking changes
		Given the database is imported from 'breakdown_schema_db'
		And a client named "local-test-microservice" with version "1.3.0" makes 9 "valid" queries:
			"""
			query hello($platform: Platform!) {
			   loyaltyCoupons(platform: $platform) {
			     expirationDate
			   }
			}
			"""
		And a client named "local-test-microservice" with version "1.3.0" makes 2 "invalid" queries:
			"""
			query hello($platform: Platform!) {
			   loyaltyCoupons(platform: $platform) {
			     expirationDate
			   }
			}
			"""
		When I send a "POST" request to "/schema/diff" with body:
		"""
		{
		  "name": "coupons",
		  "version": "newest",
		  "type_defs": "type Query { loyaltyCoupons(platform: String!): [Coupon] } type Coupon { code: ID!, value: Float!, creationDate: String!, expirationDate: String! } enum Platform { FR ES IT DE GB }"
		}
		"""
		Then the response status code should be 200
		And the response should be in JSON and contain:
		"""
		{
			"success": false,
			"data": [
				{
					"criticality": {
						"level": "BREAKING",
						"reason": "Changing the type of a field's argument can cause existing queries that use this argument to error."
					},
					"type": "FIELD_ARGUMENT_TYPE_CHANGED",
					"message": "Type for argument 'platform' on field 'Query.loyaltyCoupons' changed from 'Platform!' to 'String!'",
					"path": "Query.loyaltyCoupons.platform",
					"isBreakingChange": true,
					"totalUsages": 11
				}
			]
		}
		"""
	
	Scenario: Checking keys with different schemas
		Given the database is imported from 'breakdown_schema_db'
		And I send a "POST" request to "/schema/push" with body:
		"""
		{
		  "name": "User",
		  "version": "newest",
		  "type_defs": "type Query { getUser: User } type User @key(fields: \"id\") { id: ID! name: String }"
		}
		"""
		Then I send a "POST" request to "/schema/diff" with body:
		"""
		{
		  "name": "Reviews",
		  "version": "newest",
		  "type_defs": "type User @key(fields: \"email\") { email: String! reviews: [Review] } type Review { id: ID! body: String }"
		}
		"""
		Then the response status code should be 200
		And the response should be in JSON and contain:
		"""
		{
		  "success": false,
		  "data": [{
			"criticality": {
				"level": "BREAKING",
				"reason": "Key not found in supergraph. Please check owner graph to sync keys declaration"
			},
			"message": "Key email for type User in service Reviews not found in supergraph keys.",
			"meta": {
				"availableKeys": ["id"]
			},
			"path": "User",
			"type": "DIRECTIVE_ARGUMENT_ADDED"
		  }]
		}
		"""

