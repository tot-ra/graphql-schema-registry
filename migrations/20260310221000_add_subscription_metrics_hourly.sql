CREATE TABLE IF NOT EXISTS subscription_metric_hourly (
    subscription_name VARCHAR(255) NOT NULL,
    hour TIMESTAMP NOT NULL,
    sampled_sessions INTEGER NOT NULL DEFAULT 0,
    completed_sessions INTEGER NOT NULL DEFAULT 0,
    estimated_subscriptions DOUBLE PRECISION NOT NULL DEFAULT 0,
    transported_events BIGINT NOT NULL DEFAULT 0,
    session_duration_ms BIGINT NOT NULL DEFAULT 0,
    updated_time TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (subscription_name, hour)
);

CREATE INDEX IF NOT EXISTS idx_subscription_metric_hourly_hour
    ON subscription_metric_hourly(hour DESC);
