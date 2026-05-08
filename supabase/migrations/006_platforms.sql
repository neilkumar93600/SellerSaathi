-- Migration 006: platforms reference table
-- 2 fixed rows: amazon_india, flipkart. Seeded in 013_seed_data.sql.

CREATE TABLE IF NOT EXISTS public.platforms (
  id           text PRIMARY KEY,  -- 'amazon_india' | 'flipkart'
  display_name text NOT NULL,
  base_url     text,
  logo_url     text
);
