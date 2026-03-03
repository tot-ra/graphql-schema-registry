# MySQL to Postgres migration guide

This project now uses Postgres as the primary DB.

## 1) Configure env vars

Set source MySQL and destination Postgres connection values:

```bash
export MIGRATION_MYSQL_HOST=localhost
export MIGRATION_MYSQL_PORT=3306
export MIGRATION_MYSQL_USER=root
export MIGRATION_MYSQL_PASSWORD=root
export MIGRATION_MYSQL_DB=schema_registry

export MIGRATION_PG_HOST=localhost
export MIGRATION_PG_PORT=5432
export MIGRATION_PG_USER=postgres
export MIGRATION_PG_PASSWORD=postgres
export MIGRATION_PG_DB=schema_registry
```

## 2) Run schema + data migration

From this repository root:

```bash
npm run migrate:mysql-to-postgres
```

By default this runs Postgres migrations first and then copies table data.

## 3) Optional: skip schema migrations

If your Postgres schema is already prepared:

```bash
MIGRATION_SKIP_PG_MIGRATIONS=true npm run migrate:mysql-to-postgres
```

## 4) Start service on Postgres

Use `DB_CLIENT=pg` and Postgres credentials in your runtime env.

## Notes

- The migration script copies rows for these tables in order:
  `persisted_queries`, `services`, `schema`, `container_schema`, `clients`, `clients_persisted_queries_rel`, `schema_hit`.
- To satisfy stricter managed-Postgres setups (including DigitalOcean), all tables have explicit `id` primary keys.
- API shape is unchanged; this migration is storage-layer only.
