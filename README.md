# graphql-schema-registry

Graphql schema storage as dockerized on-premise service for federated apollo server

- Stores versioned schema for graphql-federated services
- Serves schema for graphql gateway based on provided services & their versions
- Validates new schema to be compatible with other _running_ services
- Provides UI for developers to see stored schema & its history diff
- Stores & shows in UI persisted queries passed by the gateway

## Installation
```
npm install
npm run build
docker-compose up
```

Then open http://localhost:6001

## Architecture

### Tech stack

Frontend (`/client` folder)

- react
- apollo client
- styled-components

Backend (`/app` folder)

- express, hapi/joi
- apollo-server-express, dataloader
- redis 3
- knex
- mysql 8

### Diagrams
TBD

#### DB structure
TBD

## Use cases

### Validating schema from codeship / deploy
On pre-commit / deploy make a POST /schema/validate to see if its compatible with curren schema

### Pushing schema
On service start-up (runtime), make POST to /schema/push.
Make sure to gracefully handle failure

## Development

### DB migrations

To create new DB migration, use:

```bash
npm install knex -g
knex migrate:make my_migration_name_here --migrations-directory migrations
```

## Architecture

## Rest API

### POST /schema/latest

Simplified version of /schema/compose where latest versions from different services is composed. Needed mostly for debugging

### POST /schema/compose

Lists schema based on passed services & their versions. Used by graphql gateway to fetch schema based on current containers

#### Input params
- services{ name, version}

If `services` is not passed, schema-registry tries to find most recent versions. Logic behind the scenes is that schema with _highest_ `added_time` OR `updated_time` is picked as latest. If time is the same, `schema.id` is used.

### POST /schema/push

Validates and registers new schema for a service.

#### Input params

- name
- version
- type_defs

### POST /schema/validate

Validates schema, without adding to DB

#### Input params

- name
- version
- type_defs

### POST /schema/diff

Compares schemas and finds breaking or dangerous changes between provided and latest schemas.

- name
- version
- type_defs

### DELETE /schema/delete

Deletes specified schema

#### Input params

- name
- version

### GET /persisted_query

Looks up persisted query from DB & caches it in redis if its found

#### Input params

- key

### POST /persisted_query

Adds persisted query to DB & redis cache

#### Input params

- key
- value