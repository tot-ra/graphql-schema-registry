CREATE TABLE IF NOT EXISTS schema_hit_hourly (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NULL REFERENCES clients(id) ON DELETE CASCADE,
    entity VARCHAR(150) NOT NULL DEFAULT '',
    property VARCHAR(150) NOT NULL DEFAULT '',
    hour TIMESTAMP NOT NULL,
    hits BIGINT DEFAULT NULL,
    updated_time BIGINT NULL DEFAULT NULL,
    UNIQUE (client_id, entity, property, hour)
);

CREATE INDEX IF NOT EXISTS idx_schema_hit_hourly_entity_property_hour
    ON schema_hit_hourly(entity, property, hour);
