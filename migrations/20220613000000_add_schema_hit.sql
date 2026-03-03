CREATE TABLE IF NOT EXISTS clients (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL DEFAULT '',
    version VARCHAR(50) DEFAULT '',
    calls BIGINT DEFAULT NULL,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    added_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (name, version)
);

CREATE TABLE IF NOT EXISTS clients_persisted_queries_rel (
    id BIGSERIAL PRIMARY KEY,
    version_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    pq_key VARCHAR(100) NOT NULL DEFAULT '' REFERENCES persisted_queries(key) ON DELETE CASCADE,
    UNIQUE (version_id, pq_key)
);

CREATE INDEX IF NOT EXISTS idx_clients_pq_rel_version_id ON clients_persisted_queries_rel(version_id);
CREATE INDEX IF NOT EXISTS idx_clients_pq_rel_pq_key ON clients_persisted_queries_rel(pq_key);

CREATE TABLE IF NOT EXISTS schema_hit (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NULL REFERENCES clients(id) ON DELETE CASCADE,
    entity VARCHAR(150) NOT NULL DEFAULT '',
    property VARCHAR(150) NOT NULL DEFAULT '',
    day DATE NOT NULL,
    hits BIGINT DEFAULT NULL,
    updated_time BIGINT NULL DEFAULT NULL,
    UNIQUE (client_id, entity, property, day)
);

CREATE INDEX IF NOT EXISTS idx_schema_hit_entity_property ON schema_hit(entity, property);
