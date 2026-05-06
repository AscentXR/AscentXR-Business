-- Migration 017: Drop demo_requests table.
-- We removed the Calendly webhook handler in favor of the inline embed only,
-- so there's no longer any code writing to this table. Idempotent for envs
-- where the table was never created.
DROP TABLE IF EXISTS demo_requests;
