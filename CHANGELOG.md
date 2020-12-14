# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[unreleased]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.0.7...HEAD
[1.0.6]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.0.1...v1.0.1
[1.0.0]: https://github.com/pipedrive/graphql-schema-registry/compare/v1.0.0...v1.0.0
