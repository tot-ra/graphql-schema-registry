CREATE TABLE IF NOT EXISTS subscription_sources (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ws_url VARCHAR(255) NOT NULL DEFAULT '',
    version VARCHAR(100) NOT NULL DEFAULT '',
    type_defs TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    updated_time TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    added_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (name, version)
);

CREATE INDEX IF NOT EXISTS idx_subscription_sources_name_added_time
    ON subscription_sources(name, added_time DESC);

CREATE TABLE IF NOT EXISTS subscription_definitions (
    id BIGSERIAL PRIMARY KEY,
    source_id BIGINT NOT NULL REFERENCES subscription_sources(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT '',
    payload_type VARCHAR(255) NOT NULL DEFAULT '',
    arguments JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active INTEGER NOT NULL DEFAULT 1,
    updated_time TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    added_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (source_id, name)
);

CREATE INDEX IF NOT EXISTS idx_subscription_definitions_source_id
    ON subscription_definitions(source_id);
