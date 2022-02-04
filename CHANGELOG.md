# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[unreleased]: https://github.com/pipedrive/graphql-schema-registry/compare/v2.2.1...HEAD
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
