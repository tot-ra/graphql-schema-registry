ALTER TABLE clients_persisted_queries_rel
    ADD COLUMN IF NOT EXISTS added_time TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE clients_persisted_queries_rel
    ALTER COLUMN pq_key TYPE VARCHAR(100),
    ALTER COLUMN pq_key SET DEFAULT '';
