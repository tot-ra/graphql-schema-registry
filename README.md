# graphql-schema-registry

<img src="https://user-images.githubusercontent.com/445122/95125574-d7466580-075d-11eb-8a78-b6adf34ad811.png" width=100 height=100 align="right"/>

Graphql schema storage as dockerized on-premise service for federated graphql gateway server
(based on [apollo server](https://www.apollographql.com/docs/apollo-server/federation/introduction/)) as alternative to [Apollo studio](https://studio.apollographql.com/) and [The Guild's Hive](https://graphql-hive.com)

[![slack](https://img.shields.io/badge/slack-brigade-brightgreen.svg?logo=slack)](http://gql-schema-registry.slack.com/)
![](https://img.shields.io/github/v/release/pipedrive/graphql-schema-registry?sort=semver)
[![Coverage Status](https://coveralls.io/repos/github/pipedrive/graphql-schema-registry/badge.svg?branch=master&v=2)](https://coveralls.io/github/pipedrive/graphql-schema-registry?branch=master)
[![](https://snyk.io/test/github/pipedrive/graphql-schema-registry/badge.svg)](https://snyk.io/test/github/pipedrive/graphql-schema-registry)
[![Code Style](https://img.shields.io/badge/codestyle-prettier-ff69b4.svg)](https://prettier.io/)

## Features

- Stores versioned schema for graphql-federated services
- Serves supergraph schema for graphql gateway based on provided services & their versions
- Validates new schema to be compatible with other _running_ services
- Provides UI for developers to see stored schema & its history diff
- Stores service urls emulating managed federation: you no longer need to hardcode the services in your gateway's constructor, or rely on an additonal service (etcd, consul) for service discovery
  Original internal mission that resulted in this project going live:

- [aleksandergasna](https://github.com/aleksandergasna)
- [LexSwed](https://github.com/LexSwed)

See main [blog post](https://medium.com/pipedrive-engineering/journey-to-federated-graphql-2a6f2eecc6a4)

## Rest API documentation

<details>
  <summary><h3>🟢 GET /health</h3></summary>
  
  returns "ok" when service is up
</details>

<details>
  <summary><h3>🟢 GET /schema/latest</h3></summary>
  
Simplified version of /schema/compose where latest versions from different services are composed.
Some services prefer this to use this natural schema composition, as its natural and time-based.

</details>

<details>
  <summary><h3>🟡 POST /schema/compose</h3></summary>
  
Advanced version of schema composition, where you need to provide services & their versions.
Used by graphql gateway to fetch schema based on currently running containers.

The advantage over time-based composition is that versioned composition allows to automatically
update federated schema when you deploy older version of the pod in case of some incident.
If you deploy older pods they can ofc try to register old schema again, but as it already exists
in schema-registry, it will not be considered as "latest".

#### Request params (optional, raw body)

```json
{
  "services": [
    { "name": "service_a", "version": "ke9j34fuuei" },
    { "name": "service_b", "version": "e302fj38fj3" }
  ]
}
```

#### Response example

- ❌ 400 "services[0].version" must be a string
- ❌ 500 Internal error (DB is down)
- ✅ 200

```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "service_id": 3,
      "version": "ke9j34fuuei",
      "name": "service_a",
      "url": "http://localhost:6111",
      "added_time": "2020-12-11T11:59:40.000Z",
      "type_defs": "\n\ttype Query {\n\t\thello: String\n\t}\n",
      "is_active": 1
    },
    {
      "id": 3,
      "service_id": 4,
      "version": "v1",
      "name": "service_b",
      "url": "http://localhost:6112",
      "added_time": "2020-12-14T18:51:04.000Z",
      "type_defs": "type Query {\n  world: String\n}\n",
      "is_active": 1
    }
  ]
}
```

#### Request params

- services{ name, version}

If `services` is not passed, schema-registry tries to find most recent versions. Logic behind the scenes is that schema with _highest_ `added_time` OR `updated_time` is picked as latest. If time is the same, `schema.id` is used.

</details>
<details>
  <summary><h3>🟡 POST /schema/push</h3></summary>

Validates and registers new schema for a service. If changes encountered, it also breaks down the new changes

#### Request params (optional, raw body)

```json
{
  "name": "service_a",
  "version": "ke9j34fuuei",
  "type_defs": "\n\ttype Query {\n\t\thello: String\n\t}\n"
}
```

URL is optional if you use urls from schema-registry as service discovery

```json
{
  "name": "service_b",
  "version": "jiaj51fu91k",
  "type_defs": "\n\ttype Query {\n\t\tworld: String\n\t}\n",
  "url": "http://service-b.develop.svc.cluster.local"
}
```

- ❌ 400 "You should not register different type_defs with same version."
</details>

<details>
  <summary><h3>🟡 POST /schema/validate</h3></summary>

Validates schema, without adding to DB

##### Request params (raw body)

- name
- version
- type_defs
</details>
<details>
  <summary><h3>🟡 POST /schema/diff</h3></summary>

Compares schemas and finds breaking or dangerous changes between provided and latest schemas. If 1 breaking change is encountered, all diff is counted as breaking change.
In the data field in the response is showing information about all the changes.

- name
- version
- type_defs
- min_usages: Minimum number of usages to validate if it is considered a breaking change. (DEFAULT: 10)
- usage_days: Period in days to validate the usages (DEFAULT: 30)

```json
{
  "success": false,
  "data": [
    {
      "criticality": {
        "level": "BREAKING",
        "reason": "Removing a field is a breaking change. It is preferable to deprecate the field before removing it."
      },
      "type": "FIELD_REMOVED",
      "message": "Field 'XXX' was removed from object type 'YYY'",
      "path": "YYY.XXX",
      "isBreakingChange": true,
      "totalUsages": 11
    }
  ]
}
```

</details><details><summary><h3>🔴 DELETE /schema/:schemaId</h3></summary>

Deletes specified schema

##### Request params

| Property   | Type   | Comments      |
| ---------- | ------ | ------------- |
| `schemaId` | number | ID of sechema |

</details><details><summary><h3>🔴 DELETE /service/:name</h3></summary>

Deletes specified service including all schemas registered for that service

##### Request params

| Property | Type   | Comments        |
| -------- | ------ | --------------- |
| `name`   | string | name of service |

</details><details><summary><h3>🟢 GET /persisted_query</h3></summary>

Looks up persisted query from DB & caches it in redis if its found

##### Request params (query)

| Property | Type   | Comments                         |
| -------- | ------ | -------------------------------- |
| `key`    | string | hash of APQ (with `apq:` prefix) |

</details><details><summary><h3>🟡 POST /persisted_query</h3></summary>

Adds persisted query to DB & redis cache

##### Request params (raw body)

| Property | Type   | Comments                         |
| -------- | ------ | -------------------------------- |
| `key`    | string | hash of APQ (with `apq:` prefix) |
| `value`  | string | Graphql query                    |

</details>
