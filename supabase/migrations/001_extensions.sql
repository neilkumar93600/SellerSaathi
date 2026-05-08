-- Migration 001: Enable extensions
-- Run first — all other migrations depend on uuid generation

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
