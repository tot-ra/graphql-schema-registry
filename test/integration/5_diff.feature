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
		And the redis has usage for file 'coupons.json'
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
		And the redis has usage for file 'coupons.json'
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

	Scenario: I request to diff an existing schema with modifications and is valid because no usages on the days specified
		Given the database is imported from 'breakdown_schema_db'
		And the redis has usage for file 'coupons.json'
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

