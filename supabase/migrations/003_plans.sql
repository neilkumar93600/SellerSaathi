-- Migration 003: plans reference table
-- 3 fixed rows: free, pro, agency. Seeded in 013_seed_data.sql.

CREATE TABLE IF NOT EXISTS public.plans (
  id                  text    PRIMARY KEY,  -- 'free' | 'pro' | 'agency'
  display_name        text    NOT NULL,
  monthly_price_inr   integer NOT NULL,
  credits_per_month   integer NOT NULL,
  features            jsonb   NOT NULL DEFAULT '{}',
  razorpay_plan_id    text
);
