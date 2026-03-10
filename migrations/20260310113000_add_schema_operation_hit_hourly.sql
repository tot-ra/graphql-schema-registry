CREATE TABLE IF NOT EXISTS schema_operation_hit_hourly (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NULL REFERENCES clients(id) ON DELETE CASCADE,
    operation_name VARCHAR(255) NOT NULL DEFAULT '',
    operation_type VARCHAR(32) NOT NULL DEFAULT 'UNKNOWN',
    hour TIMESTAMP NOT NULL,
    hits BIGINT DEFAULT NULL,
    updated_time BIGINT NULL DEFAULT NULL,
    UNIQUE (client_id, operation_name, operation_type, hour)
);

CREATE INDEX IF NOT EXISTS idx_schema_operation_hit_hourly_key
    ON schema_operation_hit_hourly(operation_name, operation_type, hour);
