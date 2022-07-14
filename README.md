# graphql-schema-registry

<img src="https://user-images.githubusercontent.com/445122/95125574-d7466580-075d-11eb-8a78-b6adf34ad811.png" width=100 height=100 align="right"/>

Graphql schema storage as dockerized on-premise service for federated graphql gateway server
(based on [apollo server](https://www.apollographql.com/docs/apollo-server/federation/introduction/)) as alternative to [Apollo studio](https://studio.apollographql.com/)

![](https://img.shields.io/travis/pipedrive/graphql-schema-registry/master?logo=travis)
![](https://img.shields.io/github/v/release/pipedrive/graphql-schema-registry?sort=semver)
![](https://img.shields.io/coveralls/github/pipedrive/graphql-schema-registry/master?logo=coveralls)
[![](https://snyk.io/test/github/pipedrive/graphql-schema-registry/badge.svg)](https://snyk.io/test/github/pipedrive/graphql-schema-registry)
[![Code Style](https://img.shields.io/badge/codestyle-prettier-ff69b4.svg)](https://prettier.io/)

## Features

- Stores versioned schema for graphql-federated services
- Serves schema for graphql gateway based on provided services & their versions
- Validates new schema to be compatible with other _running_ services
- Provides UI for developers to see stored schema & its history diff
- Stores & shows in UI persisted queries passed by the gateway for debugging
- Stores service urls emulating managed federation: you no longer need to hardcode the services in your gateway's constructor, or rely on an additonal service (etcd, consul) for service discovery
- Async schema registration of new schema with events to avoid polling (`schema-registry -> kafka -> gateway`)

<img width="1312" alt="Screenshot 2022-02-08 at 00 16 49" src="https://user-images.githubusercontent.com/445122/152881795-535a6990-a318-4e89-afc9-c508ddc840fa.png">

## Roadmap

(Pull requests are encouraged on these topics)

- Usage tracking (to avoid breaking changes) - needs a separate docker sub-process in golang
  - registered clients (based on headers, including apollo-\* ones)
  - schema usage breakdown by multiple facets - property, day, query name, client name
  - fixed data retention
- schema registration examples (node/go/php...)
- schema linting rules (camelCase, mandatory descriptions, too big objects, inconsistent pagination, dates not in DateTime...)
  - integrate [inspector](https://graphql-inspector.com/docs/essentials/diff)
- global search (not only service-specific)
- webhooks/slack integration (notifify on schema change)
- performance tracking (to know what resolvers to optimize)
- access control - lightweight authentication in case this internal tool is publicly accessible
- separate ephemeral automatic PQs, registered by frontend (use cache only with TTL) from true PQs backend-registered persisted queries (use DB only)

## Configuration

We use environment variables for configuration.
You can:

- pass them directly
- add .env file and dotenv will pick them up
- add them to `docker-compose.yml` or `Dockerfile`

The following are the different environment variables that are looked up that allow configuring the schema registry in different ways.

| Variable Name         | Description                                                                   | Default                   |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------- |
| DB_HOST               | Host name of the MySQL server                                                 | gql-schema-registry-db    |
| DB_USERNAME           | Username to connect to MySQL                                                  | root                      |
| DB_SECRET             | Password used to connect to MySQL                                             | root                      |
| DB_PORT               | Port used when connecting to MySQL                                            | 3306                      |
| DB_NAME               | Name of the MySQL database to connect to                                      | schema-registry           |
| DB_EXECUTE_MIGRATIONS | Controls whether DB migrations are executed upon registry startup or not      | true                      |
| REDIS_HOST            | Host name of the Redis server                                                 | gql-schema-registry-redis |
| REDIS_PORT            | Port used when connecting to Redis                                            | 6379                      |
| REDIS_SECRET          | Password used to connect to Redis                                             | Empty                     |
| ASSETS_URL            | Controls the url that web assets are served from                              | localhost:6001            |
| NODE_ENV              | Specifies the environment. Use _production_ to load js/css from `dist/assets` | Empty                     |
| ASYNC_SCHEMA_UPDATES  | Specifies if async achema updates is enabled                                  | false                     |
| KAFKA_BROKER_HOST     | Host name of the Kafka broker, used if ASYNC_SCHEMA_UPDATES = true            | gql-schema-registry-kafka |
| KAFKA_BROKER_PORT     | Port used when connecting to Kafka, used if ASYNC_SCHEMA_UPDATES = true       | 9092                      |
| LOG_LEVEL             | Minimum level of logs to output                                               | info                      |
| LOG_TYPE              | Output log type, supports pretty or json.                                     | pretty                    |

For development we rely on docker network and use hostnames from `docker-compose.yml`.
Node service uses to connect to mysql & redis and change it if you install it with own setup.
For dynamic service discovery (if you need multiple hosts for scaling), override `app/config.js` and `diplomat.js`

## Installation

With default settings, UI should be accessible at [http://localhost:6001](http://localhost:6001)

### On bare host

```
git clone https://github.com/pipedrive/graphql-schema-registry.git && cd graphql-schema-registry
cp example.env .env && nano .env
node app/schema-registry.js
```

### Docker image

We have [docker image published](https://hub.docker.com/r/pipedrive/graphql-schema-registry/tags) for main node service.
It assumes you have mysql/redis running separately.
Use exact IP instead of `localhost`.
Use exact docker image tag to avoid breaking changes.

```
docker pull pipedrive/graphql-schema-registry:3.0.1
docker run -e DB_HOST=localhost -e DB_USERNAME=root -e DB_PORT=6000 -p 6001:3000 pipedrive/graphql-schema-registry
```

### Docker-compose

```
git clone https://github.com/pipedrive/graphql-schema-registry.git && cd graphql-schema-registry
docker-compose up
```

## Use cases

### Validating schema on deploy

On pre-commit / deploy make a POST /schema/validate to see if its compatible with current schema.

### Schema registration

On service start-up (runtime), make POST to /schema/push to register schema (see API reference for details).
Make sure to handle failure.

See [example](examples/schema_registration_client/index.js) for nodejs/ESM.

### Schema migration

If service A contains schema that needs to be migrated to service B, we need to orchestrate schema & traffic change.
Instead of juggling with schema status flags, we suggest the following scenario:

- service B gets deployed with new schema which includes cycle of attempts to register new schema (for example every 5 sec).
- schema-registry responds with validation errors
- service A without conflicting schema gets deployed & updates schema-registry
- service B manages to register new schema & stops the cycle

## Architecture

### Tech stack

| Frontend (`/client` folder) | Backend (`/app` folder)           |
| --------------------------- | --------------------------------- |
| react                       | nodejs 14                         |
| apollo client               | express, hapi/joi                 |
| styled-components           | apollo-server-express, dataloader |
|                             | redis 6                           |
|                             | knex                              |
|                             | mysql 8                           |

### Components

graphql-schema-registry service is one of the components for graphql federation, but it needs tight
integration with gateway. Check out [examples folder](examples/README.md) on how to implement it. Note however, that
gateway is very simplified and does not have proper error handling, cost limits or fail-safe mechanisms.

In gateway, you may also find useful our [graphql-query-cost](https://github.com/pipedrive/graphql-query-cost) library too. Check it out

![](https://lucid.app/publicSegments/view/594e3e1d-ef93-41ba-b4a0-c1f2fb8e0495/image.png)

### DB structure

Migrations are done using knex
![](https://app.lucidchart.com/publicSegments/view/74fc86d4-671e-4644-a198-41d7ff681cae/image.png)

## Development

### Dockerized mode

```
nvm use
npm install
npm run build
docker-compose -f docker-compose.dev.yml up
```

### Running in light mode

To have fast iteration of working on UI changes, you can avoid running node service in docker, and run only mysql & redis

```
docker-compose -f docker-compose.light.yml up -d
npm run develop
```

### DB migrations

To create new DB migration, use:

```bash
npm run new-db-migration
```

If not using the default configuration of executing DB migrations on service startup, you can run the following `npm`
command prior to starting the registry:

```bash
npm run migrate-db
```

The command can be prefixed with any environment variable necessary to configure DB connection (in case you ALTER DB with another user), such as:

```bash
DB_HOST=my-db-host DB_PORT=6000 npm run migrate-db
```

## Testing

### Unit tests

use jest, coverage is quite low as most logic is in db or libraries.

```
npm run test
```

### Functional tests

require docker, mostly blackbox type - real http requests are done against containers.
DB tables are truncated after every test from within `test/functional/bootstrap.js`
Jest runs in single worker mode to avoid tests from affecting each other due to same state.

```
#docker-compose -f docker-compose.light.yml up -d
#npm run develop

npm run test-functional
```

### Performance tests

use [k6](https://k6.io/docs/) + dockerized setup similar to functional tests above + grafana and influxdb for reporting the load
these tests are intended just to show/detect avg latencies of most important endpoints

```
docker-compose -f docker-compose.perf-tests.yml up
open http://localhost:8087/dashboard/import
// Add "2587" to ID, pick influxdb datasource, import dashboard and observe it when you run tests

docker-compose -f docker-compose.perf-tests.yml run --rm k6 run /scripts/schema-latest.test.js
```

<img width="900" alt="Screenshot 2022-05-25 at 01 54 30" src="https://user-images.githubusercontent.com/445122/170144969-d46089ae-b049-459b-a37d-b4d197753bc6.png">

### Testing Dockerimage build

If you change build process in Dockerfile or Dockerfile.CI, consider checking also testing it

```
# run db
docker-compose -f docker-compose.light.yml up

#build local image
docker build -t local/graphql-schema-registry .

# try to run it
docker run -e DB_HOST=$(ipconfig getifaddr en0) -e DB_USERNAME=root -e DB_PORT=6000 -p 6001:3000 local/graphql-schema-registry
```

## Contribution

- Commit often (instead of making huge commits)
- Add verb at the beginning of commit message
- Add why you're doing something in commit message
- Reference issues
- When making a pull request, be sure to follow the format of what is the problem you're fixing, what was changed & how to test it. Screenshots/videos are a welcome
- Fill [CHANGELOG](CHANGELOG.md)
- To avoid vulnerabilities, please use fixed versions in package.json

### Authors and acknowledgment

Current maintainer - [@tot-ra](https://github.com/tot-ra). Mention in PR, if it is stuck

Original internal mission that resulted in this project going live:

- [aleksandergasna](https://github.com/aleksandergasna)
- [ErikSchults](https://github.com/ErikSchults)
- [LexSwed](https://github.com/LexSwed)

See main [blog post](https://medium.com/pipedrive-engineering/journey-to-federated-graphql-2a6f2eecc6a4)

## Rest API documentation

### GET /schema/latest

Simplified version of /schema/compose where latest versions from different services are composed.
Some services prefer this to use this natural schema composition, as its natural and time-based.

### POST /schema/compose

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

- ❌ 400 "services[0].version" must be a string
- ❌ 500 Internal error (DB is down)

#### Request params

- services{ name, version}

If `services` is not passed, schema-registry tries to find most recent versions. Logic behind the scenes is that schema with _highest_ `added_time` OR `updated_time` is picked as latest. If time is the same, `schema.id` is used.

### POST /schema/push

Validates and registers new schema for a service.

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

#### POST /schema/validate

Validates schema, without adding to DB

##### Request params (raw body)

- name
- version
- type_defs

#### POST /schema/diff

Compares schemas and finds breaking or dangerous changes between provided and latest schemas.

- name
- version
- type_defs

#### DELETE /schema/:schemaId

Deletes specified schema

##### Request params

| Property   | Type   | Comments      |
| ---------- | ------ | ------------- |
| `schemaId` | number | ID of sechema |

#### DELETE /service/:name

Deletes specified service including all schemas registered for that service

##### Request params

| Property | Type   | Comments        |
| -------- | ------ | --------------- |
| `name`   | string | name of service |

#### GET /persisted_query

Looks up persisted query from DB & caches it in redis if its found

##### Request params (query)

| Property | Type   | Comments                         |
| -------- | ------ | -------------------------------- |
| `key`    | string | hash of APQ (with `apq:` prefix) |

#### POST /persisted_query

Adds persisted query to DB & redis cache

##### Request params (raw body)

| Property | Type   | Comments                         |
| -------- | ------ | -------------------------------- |
| `key`    | string | hash of APQ (with `apq:` prefix) |
| `value`  | string | Graphql query                    |
