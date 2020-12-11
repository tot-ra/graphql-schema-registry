# graphql-schema-registry

<img src="https://user-images.githubusercontent.com/445122/95125574-d7466580-075d-11eb-8a78-b6adf34ad811.png" width=100 height=100 align="right"/>

Graphql schema storage as dockerized on-premise service for federated graphql gateway server
(based on [apollo server](https://www.apollographql.com/docs/apollo-server/federation/introduction/)) as alternative to [Apollo studio](https://studio.apollographql.com/)

![](https://img.shields.io/travis/pipedrive/graphql-schema-registry/master?logo=travis)
![](https://img.shields.io/github/v/release/pipedrive/graphql-schema-registry?sort=semver)
![](https://img.shields.io/coveralls/github/pipedrive/graphql-schema-registry/master?logo=coveralls)

## Features

- Stores versioned schema for graphql-federated services
- Serves schema for graphql gateway based on provided services & their versions
- Validates new schema to be compatible with other _running_ services
- Provides UI for developers to see stored schema & its history diff
- Stores & shows in UI persisted queries passed by the gateway for debugging

<img width="1309" alt="Screenshot 2020-08-31 at 15 40 43" src="https://user-images.githubusercontent.com/445122/91720806-65985c00-eba0-11ea-8763-986b9f3f166b.png">

## Roadmap
- client tracking (for breaking changes)
- schema usage tracking (for breaking changes)
- separate APQs (use cache only) from backend-registered persisted queries (use DB only)

## Installation
Assuming you have [nvm](https://github.com/nvm-sh/nvm) & [docker](https://www.docker.com/) installed:

```
nvm use
npm install
npm run build
docker-compose up --build
```

Open http://localhost:6001

## Configuration
We rely on docker network and uses hostnames from `docker-compose.yml`. 
Check `app/config.js` to see credentials that node service uses to connect to mysql & redis and change it if you install it with own setup. If you use dynamic service discovery (consul/etcd), edit `diplomat.js`

## Use cases

### Validating schema on deploy

On pre-commit / deploy make a POST /schema/validate to see if its compatible with current schema.

### Schema registration

On service start-up (runtime), make POST to /schema/push to register schema (see API reference for details).
Make sure to handle failure.

## Architecture

### Tech stack

Frontend (`/client` folder)

- react
- apollo client
- styled-components

Backend (`/app` folder)

- nodejs 14
- express, hapi/joi
- apollo-server-express, dataloader
- redis 3
- knex
- mysql 8

### Components

graphql-schema-registry service is one of the components for graphql federation, but it needs tight
integration with gateway. Check out [examples folder](examples/README.md) on how to implement it. Note however, that
gateway is very simplified and does not have proper error handling, cost limits or fail-safe mechanisms.

![](https://app.lucidchart.com/publicSegments/view/7cd430fc-05b7-4c9e-8dc4-15080da125c6/image.png?v=2)

### DB structure

Migrations are done using knex
![](https://app.lucidchart.com/publicSegments/view/74fc86d4-671e-4644-a198-41d7ff681cae/image.png)

## Development

### DB migrations

To create new DB migration, use:

```bash
npm install knex -g
knex migrate:make my_migration_name_here --migrations-directory migrations
```

### Contribution

- Before making PR, make sure to run `npm run version` & fill [CHANGELOG](CHANGELOG.md)

#### Honorable mentions

Original internal mission that resulted in this project consisted of (in alphabetical order):

- [aleksandergasna](https://github.com/aleksandergasna)
- [ErikSchults](https://github.com/ErikSchults)
- [LexSwed](https://github.com/LexSwed)
- [tot-ra](https://github.com/tot-ra)

## API documentation

### Rest API

#### GET /schema/latest

Simplified version of /schema/compose where latest versions from different services is composed. Needed mostly for debugging

#### POST /schema/compose

Lists schema based on passed services & their versions. Used by graphql gateway to fetch schema based on current containers

##### Input params

- services{ name, version}

If `services` is not passed, schema-registry tries to find most recent versions. Logic behind the scenes is that schema with _highest_ `added_time` OR `updated_time` is picked as latest. If time is the same, `schema.id` is used.

#### POST /schema/push

Validates and registers new schema for a service.

##### Input params

- name
- version
- type_defs

#### POST /schema/validate

Validates schema, without adding to DB

##### Input params

- name
- version
- type_defs

#### POST /schema/diff

Compares schemas and finds breaking or dangerous changes between provided and latest schemas.

- name
- version
- type_defs

#### DELETE /schema/delete

Deletes specified schema

##### Input params

- name
- version

#### GET /persisted_query

Looks up persisted query from DB & caches it in redis if its found

##### Input params

- key

#### POST /persisted_query

Adds persisted query to DB & redis cache

##### Input params

- key
- value
