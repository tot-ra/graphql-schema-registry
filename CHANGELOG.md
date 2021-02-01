# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[unreleased]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.2.1...HEAD

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
