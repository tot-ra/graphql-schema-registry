# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Types of changes:

- Added for new features.
- Changed for changes in existing functionality.
- Deprecated for soon-to-be removed features.
- Removed for now removed features.
- Fixed for any bug fixes.
- Security in case of vulnerabilities.

## [Unreleased]

## [5.0.0] 2022-09-23

## Breaking Changed

- apollo federation v2 is used within schema validation.
  You need to follow the [migration guide by apollo](https://www.apollographql.com/docs/federation/federation-2/moving-to-federation-2/), upgrade gateway and may need to change subgraph schemas
- apollo composition library [migrated from MIT license to ELv2](https://www.apollographql.com/blog/announcement/moving-apollo-federation-2-to-the-elastic-license-v2/), which [adds limitations on how you can use it](https://github.com/apollographql/federation/blob/main/LICENSE#L22), which does not affect graphql-schema-registry source code as we only reference it (and its up to you, client, to install and use the library), but docker image _is affected_ as it bundles/distributes the library.

Basically you cannot use graphql-schema-registry docker image to commercially compete with Apollo Studio, otherwise its fine to use as internal tool. If you feel this is unfair, feel free to create PR with alternative/pluggable schema validation method.

## [4.0.0] - 2022-07-17

## Added

- **New Feature - schema usage**
  - New DB migration adds `clients`, `clients_persisted_queries_rel` and `schema_hit` tables
  - Async workrer which analyzes graphql queries and maps them onto schemas to generate schema hits (usage), see `src/worker` and also `examples` for more details. As this requires manual setup, released as major version.
  - graphql schemas & resolvers to provide schema usage
  - UI to see schema usage tab (under specific service schema)
    - Added rumble-charts dependency to draw graphs
  - UI - renamed schemas -> services in menu & added counter
- Added redlock dependency - it now locks schema registration for some time in case multiple instances of new service try to register same schema & overload the DB. Now only one instance gets access and others wait
- Tooling
  - added integration tests, mostly useful for worker testing as its async

## Updated

- async-redis -> ioredis
- docker-compose files are not simpler and more composeable

## [3.5.0] - 2022-07-14

## Updated

- knex major version bump 0.20.2 -> 2.1.0

## [3.4.0] - 2022-06-07

## Updated

- nodejs version 14 -> 16

## [3.3.0] - 2022-05-25

## Updated

- /schema/latest now does not have schema validation, because we expect schema to be validated
  during /schema/push. This is performance improvement
- added performance tests. Mean duration for simple schema perf test ~ 660 ms (dockerized, your experience may differ)

## [3.2.3] - 2022-05-25

## Fixed

- /schema/push now returns 400 instead of 500 if you attempt to register service schema with same version
- note, that you can register schema from multiple pods if it is the same (type definitions are matched)

## [3.2.2] - 2022-05-24

## Updated

- Fonts in diff & definition tabs are now monospace & same size
- Added support for use `TypeScript` in the client side code. A pair of components were converted to TypeScript to validate the configuration.
- Added the configuration for `testing-library/react` and `testing-library/react-hooks`, so unit tests could be added to the client side code. A pair of tests were added to validate the configuration.
- `eslint-webpack-plugin` was added to avoid forgetting to fix eslint and prettier issues during development.
- Some commands on Dockerfiles were rewritten to benefit from caching when executing `npm install`

## [3.2.1] - 2022-05-14

### Updated

- Added react-refresh-webpack-plugin. It only executes in development mode: its setup is conditionally imported in server side, so its inclusion is omitted in production mode.
- For the setup of the previous one, I've had to wrap all the server setup in a async function to make the conditional import works. It doesn't affect to any functionality.
- Added source map loading for node_modules libraries.
- Removed some unused dependencies.

## [3.2.0] - 2022-05-05

### Updated

- `eslint` libraries were being listed as dependencies but not config was set. So an eslint config was added.
- Same thing with `prettier`, it was listed as a dependency and executed on commit (not configured for ts files though) but some files were not formatted with it.
- Some unused dependencies were removed from both `dependencies` and `devDependencies`.
- Removed react-hot-loader because it was not proper configured. I have already a working version with [react-refresh-webpack-plugin](https://github.com/pmmmwh/react-refresh-webpack-plugin) planned for a future PR.
- Some libraries (mostly for the frontend part compilation) were upgrades in order to `improve` the generation of the bundle.
- Some `general cleanup`: removed unused imports, unused declarations, etc.

## [3.1.0] - 2022-05-05

### Added

- Added dependency to winston
- Added an instance of logger in logger.ts and removed the logging functions
- Replace every use of the previous logger functions with calls to the logger exposed from logger.ts

### Fixed

- npm lock version 2
- graphql & @apollo/federation version compatibility
- mysql2 & knex version compatibility
- npm audit issues

## [3.0.1] - 2022-02-08

### Updated

- Fixed UI issues with logo causing page slider
- Fixed UI issue with diff view font size and width of comparison blocks

## [3.0.0] - 2022-02-07

### Updated

- full rewrite / migration to typescript. Using major version, because of potential incompatibilities that may arise if native installation is used, for example `schema-registry.js` file that was moved from project root into `app` folder

## [2.2.4] - 2022-02-05

### Fixed

- 404 error on `__webpack_hmr` URL

## [2.2.3] - 2022-02-04

### Added

- functional tests

## [2.2.2] - 2022-02-04

### Updated

- fixed package.lock registry URL to registry.npmjs.org
- switching to fixed node versions
- updated npm dependencies

## [2.2.1] - 2021-12-08

### Updated

- Fixed ASYNC_SCHEMA_UPDATES, when the variable is not set, Kafka objects get initialized, and when you don't have Kafka running, it results in a startup error

## [2.2.0] - 2021-11-23

### Added

- New feature - asynchroneous notification of gateway via kafka to avoid polling & reduce schema inconsistency time. See [examples/gateway_service_kafka_notification] for gateway. Use env vars to configure schema-registry

## [2.1.1] - 2021-11-08

### Updated

- Dependencies in examples
- Dependabot security updates

## [2.1.0] - 2021-10-25

### Updated

- Added dotenv and ability to set configuration vars in .env file

## [2.0.1] - 2021-10-25

### Updated

- Security update elliptic from 6.5.3 to 6.5.4

## [2.0.0] - 2021-10-01

### Added

- New endpoint to hard-delete schemas of specific service
  DELETE /schema/:schemaId

### Breaking Change

- Renamed endpoint that deactivates specific schema
  Before:
  DELETE /schema/delete/:schemaId

After:
DELETE /schema/:schemaId

## [1.2.5] - 2021-06-02

### Added

- Service url storage to emulate managed federation
- logo to navigation
- dockerized light mode for faster UI development (see README)

### Changed

- reduced paddings in UI

## [1.2.4] - 2021-05-25

### Changed

- Fixed handling deactivated schemas when building the federated graph

## [1.2.3] - 2021-02-22

### Added

- Dockerfile now builds a self-contained deployment artefact.

### Changed

- Removed debug logging in production environments.

## [1.2.2] - 2021-02-01

### Changed

- Assets can now be served from compiled version, depending on NODE_ENV env var

## [1.2.1] - 2021-01-22

### Changed

- ASSETS_URL supports serving service over https now

## [1.2.0] - 2021-01-12

### Changed

- SQL migrations are now using sql files instead of js files, in case you need to ALTER DB with separate process and user

## [1.1.4] - 2020-12-22

### Added

- New environment variable controlling the execution of DB migrations on application startup.
- New `npm` command to execute DB migrations explicitly.

## [1.1.3] - 2020-12-20

### Fixed

- fixed db credentials in docker-compose.yaml causing container startup issues, relying on root:root only now

## [1.1.2] - 2020-12-17

### Added

- Database name is now configureable with env variable DB_NAME

## [1.1.1] - 2020-12-16

### Fixed

- Default database service name matches config

## [1.1.0] - 2020-12-14

### Added

- Custom directives are supported in /schema/validate and /schema/push APIs
- dependencies updated

## [1.0.7] - 2020-12-14

### Fixed

- /schema/delete endpoint uses schema id instead of name & version, same as graphql

## [1.0.6] - 2020-12-11

### Changed

- Introduced environment variables for such things as MySQL & Redis connection parameters.

## [1.0.5] - 2020-12-11

### Changed

- Moved credentials from diplomat.js to config.js

## [1.0.4] - 2020-09-14

### Security

- Updated node-fetch in examples

## [1.0.3] - 2020-09-09

### Added

- Unit testing with jest & travis integration

## [1.0.2] - 2020-09-08

### Added

- Schema character length diff compared to previous version (red/green) in schema version list

### Fixed

- Increased max schema type_defs in body_parser middleware and in DB from ~100KB to ~16MB

## [1.0.1] - 2020-09-03

### Security

- Updated prismjs version 1.19.0 to 1.21.0

## [1.0.0] - 2020-09-03

### Added

- Backend service
- Frontend app
- Examples of gateway + 2 federated services

[unreleased]: https://github.com/pipedrive/graphql-schema-registry/compare/v3.5.0...HEAD
[3.5.0]: https://github.com/pipedrive/graphql-schema-registry/compare/v3.4.0...v3.5.0
[3.4.0]: https://github.com/pipedrive/graphql-schema-registry/compare/v3.3.0...v3.4.0
[3.3.0]: https://github.com/pipedrive/graphql-schema-registry/compare/v3.2.3...v3.3.0
[3.2.3]: https://github.com/pipedrive/graphql-schema-registry/compare/v3.2.2...v3.2.3
[3.2.2]: https://github.com/pipedrive/graphql-schema-registry/compare/v3.2.1...v3.2.2
[3.2.1]: https://github.com/pipedrive/graphql-schema-registry/compare/v3.2.0...v3.2.1
[3.2.0]: https://github.com/pipedrive/graphql-schema-registry/compare/v3.1.0...v3.2.0
[3.1.0]: https://github.com/pipedrive/graphql-schema-registry/compare/v3.0.1...v3.1.0
[3.0.1]: https://github.com/pipedrive/graphql-schema-registry/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/pipedrive/graphql-schema-registry/compare/v2.2.4...v3.0.0
[2.2.4]: https://github.com/pipedrive/graphql-schema-registry/compare/v2.2.3...v2.2.4
[2.2.3]: https://github.com/pipedrive/graphql-schema-registry/compare/v2.2.2...v2.2.3
[2.2.2]: https://github.com/pipedrive/graphql-schema-registry/compare/v2.2.1...v2.2.2
[2.2.1]: https://github.com/pipedrive/graphql-schema-registry/compare/v2.2.0...v2.2.1
[2.2.0]: https://github.com/pipedrive/graphql-schema-registry/compare/v2.1.1...v2.2.0
[2.1.1]: https://github.com/pipedrive/graphql-schema-registry/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/pipedrive/graphql-schema-registry/compare/v2.0.1...v2.1.0
[2.0.1]: https://github.com/pipedrive/graphql-schema-registry/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.2.5...v2.0.0
[1.2.5]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.2.4...v1.2.5
[1.2.4]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.2.3...v1.2.4
[1.2.3]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.1.4...v1.2.0
[1.1.4]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.1.3...v1.1.4
[1.1.3]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.0.7...v1.1.0
[1.0.7]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.0.1...v1.0.1
[1.0.0]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.0.0...v1.0.0
