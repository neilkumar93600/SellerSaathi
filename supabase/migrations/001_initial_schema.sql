-- Migration 001: Enable extensions
-- Run first â€” all other migrations depend on uuid generation

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- Migration 002: profiles table
-- Mirrors auth.users (1:1). Auto-created via trigger on auth.users INSERT.

CREATE TABLE IF NOT EXISTS public.profiles (
  id                  uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               text        NOT NULL,
  full_name           text,
  avatar_url          text,
  plan                text        NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'agency')),
  credits_remaining   integer     NOT NULL DEFAULT 3,
  language_preference text        NOT NULL DEFAULT 'en',
  primary_platform    text        NOT NULL DEFAULT 'amazon_india',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup by email
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);

-- Trigger: keep updated_at current
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger: auto-create profile row on auth.users INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


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


-- Migration 004: subscriptions table

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id                   text        NOT NULL REFERENCES public.plans(id),
  status                    text        NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  razorpay_subscription_id  text        UNIQUE,
  razorpay_customer_id      text,
  current_period_start      timestamptz,
  current_period_end        timestamptz,
  cancel_at_period_end      boolean     NOT NULL DEFAULT false,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions (user_id);
CREATE INDEX IF NOT EXISTS subscriptions_razorpay_sub_id_idx ON public.subscriptions (razorpay_subscription_id);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- Migration 005: credit_transactions table
-- listing_id and poa_id are nullable FK â€” added after listings/poa_requests tables exist.
-- The FK constraints are deferred to migration 008 and 009 to avoid forward-reference issues.

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount      integer     NOT NULL,  -- positive = added, negative = used
  type        text        NOT NULL
                CHECK (type IN ('purchase', 'usage', 'bonus', 'monthly_reset', 'refund')),
  description text,
  listing_id  uuid,       -- FK to listings(id) added in 008_listings.sql
  poa_id      uuid,       -- FK to poa_requests(id) added in 009_poa_requests.sql
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS credit_transactions_user_id_idx ON public.credit_transactions (user_id);
CREATE INDEX IF NOT EXISTS credit_transactions_created_at_idx ON public.credit_transactions (created_at DESC);


-- Migration 006: platforms reference table
-- 2 fixed rows: amazon_india, flipkart. Seeded in 013_seed_data.sql.

CREATE TABLE IF NOT EXISTS public.platforms (
  id           text PRIMARY KEY,  -- 'amazon_india' | 'flipkart'
  display_name text NOT NULL,
  base_url     text,
  logo_url     text
);


-- Migration 007: categories table
-- Self-referencing via parent_id for nested categories.

CREATE TABLE IF NOT EXISTS public.categories (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id text    NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  name        text    NOT NULL,
  slug        text    NOT NULL,
  parent_id   uuid    REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order  integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS categories_platform_id_idx ON public.categories (platform_id);
CREATE INDEX IF NOT EXISTS categories_parent_id_idx   ON public.categories (parent_id);
CREATE UNIQUE INDEX IF NOT EXISTS categories_platform_slug_uidx ON public.categories (platform_id, slug);


-- Migration 008: listings table
-- Also adds FK from credit_transactions.listing_id â†’ listings(id)

CREATE TABLE IF NOT EXISTS public.listings (
  id                        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform_id               text        NOT NULL REFERENCES public.platforms(id),
  category_id               uuid        REFERENCES public.categories(id) ON DELETE SET NULL,
  -- Input fields
  input_title               text,
  input_description         text,
  input_bullets             jsonb,      -- array of strings
  input_specs               jsonb,      -- key-value pairs
  input_keywords            text,
  output_language           text        NOT NULL DEFAULT 'en',
  -- Output fields
  optimized_title           text,
  optimized_description     text,
  optimized_bullets         jsonb,
  optimized_backend_keywords text,
  seo_score_before          integer,
  seo_score_after           integer,
  -- Meta
  status                    text        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  credits_used              integer     NOT NULL DEFAULT 1,
  error_message             text,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS listings_user_id_idx    ON public.listings (user_id);
CREATE INDEX IF NOT EXISTS listings_status_idx     ON public.listings (status);
CREATE INDEX IF NOT EXISTS listings_created_at_idx ON public.listings (created_at DESC);

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Now that listings exists, add the FK from credit_transactions
ALTER TABLE public.credit_transactions
  ADD CONSTRAINT credit_transactions_listing_id_fkey
  FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE SET NULL;


-- Migration 009: poa_requests table
-- Also adds FK from credit_transactions.poa_id â†’ poa_requests(id)

CREATE TABLE IF NOT EXISTS public.poa_requests (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform_id             text        NOT NULL REFERENCES public.platforms(id),
  asin_or_listing_id      text,
  suspension_reason       text,
  suspension_notice_text  text,
  suspension_notice_url   text,         -- Supabase Storage path
  generated_poa           text,
  poa_version             integer     NOT NULL DEFAULT 1,
  status                  text        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  credits_used            integer     NOT NULL DEFAULT 2,
  error_message           text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS poa_requests_user_id_idx    ON public.poa_requests (user_id);
CREATE INDEX IF NOT EXISTS poa_requests_status_idx     ON public.poa_requests (status);
CREATE INDEX IF NOT EXISTS poa_requests_created_at_idx ON public.poa_requests (created_at DESC);

CREATE TRIGGER poa_requests_updated_at
  BEFORE UPDATE ON public.poa_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Now that poa_requests exists, add the FK from credit_transactions
ALTER TABLE public.credit_transactions
  ADD CONSTRAINT credit_transactions_poa_id_fkey
  FOREIGN KEY (poa_id) REFERENCES public.poa_requests(id) ON DELETE SET NULL;


-- Migration 010: payments table

CREATE TABLE IF NOT EXISTS public.payments (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type                  text        NOT NULL CHECK (type IN ('subscription', 'credits')),
  plan_id               text        REFERENCES public.plans(id),
  credits_purchased     integer,
  amount_inr            integer     NOT NULL,
  razorpay_order_id     text        UNIQUE,
  razorpay_payment_id   text        UNIQUE,
  razorpay_signature    text,
  status                text        NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'captured', 'failed', 'refunded')),
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_user_id_idx          ON public.payments (user_id);
CREATE INDEX IF NOT EXISTS payments_razorpay_order_id_idx ON public.payments (razorpay_order_id);
CREATE INDEX IF NOT EXISTS payments_status_idx           ON public.payments (status);


-- Migration 011: Row Level Security policies for all tables
-- Enable RLS first, then define policies.
-- Service role always bypasses RLS; these policies govern anon/authenticated roles.

-- â”€â”€â”€ profiles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: user reads own row"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles: user updates own row"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- â”€â”€â”€ plans â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plans: public read"
  ON public.plans FOR SELECT
  TO anon, authenticated
  USING (true);

-- â”€â”€â”€ subscriptions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions: user reads own"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT / UPDATE only via service role (API routes using admin client)

-- â”€â”€â”€ credit_transactions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credit_transactions: user reads own"
  ON public.credit_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT only via service role

-- â”€â”€â”€ platforms â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platforms: public read"
  ON public.platforms FOR SELECT
  TO anon, authenticated
  USING (true);

-- â”€â”€â”€ categories â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories: public read"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- â”€â”€â”€ listings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listings: user selects own"
  ON public.listings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "listings: user inserts own"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "listings: user updates own"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "listings: user deletes own"
  ON public.listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- â”€â”€â”€ poa_requests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.poa_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "poa_requests: user selects own"
  ON public.poa_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "poa_requests: user inserts own"
  ON public.poa_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "poa_requests: user updates own"
  ON public.poa_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "poa_requests: user deletes own"
  ON public.poa_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- â”€â”€â”€ payments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments: user reads own"
  ON public.payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT / UPDATE only via service role


-- Migration 012: DB functions & triggers
-- All functions are SECURITY DEFINER so they run with owner privileges
-- (bypassing RLS), making them safe to call via authenticated RPC.

-- â”€â”€â”€ Helper: set_updated_at â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- (already created in 002_profiles.sql; skip if re-running)

-- â”€â”€â”€ Function: get_credits_and_deduct â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Atomically checks and deducts credits. Call via supabase.rpc() in API routes.
-- Returns: { success, credits_remaining, error }

CREATE OR REPLACE FUNCTION public.get_credits_and_deduct(
  p_user_id uuid,
  p_amount  integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_credits integer;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT credits_remaining
    INTO v_credits
    FROM public.profiles
   WHERE id = p_user_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'credits_remaining', 0,
      'error', 'User profile not found'
    );
  END IF;

  IF v_credits < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'credits_remaining', v_credits,
      'error', 'Insufficient credits'
    );
  END IF;

  UPDATE public.profiles
     SET credits_remaining = credits_remaining - p_amount,
         updated_at        = now()
   WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'credits_remaining', v_credits - p_amount,
    'error', null
  );
END;
$$;

-- â”€â”€â”€ Function: reset_monthly_credits â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Called by webhook handler on subscription renewal.

CREATE OR REPLACE FUNCTION public.reset_monthly_credits(
  p_user_id uuid,
  p_plan_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_credits integer;
BEGIN
  SELECT credits_per_month
    INTO v_credits
    FROM public.plans
   WHERE id = p_plan_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan % not found', p_plan_id;
  END IF;

  UPDATE public.profiles
     SET credits_remaining = v_credits,
         plan              = p_plan_id,
         updated_at        = now()
   WHERE id = p_user_id;

  -- Record the reset as a transaction
  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, v_credits, 'monthly_reset',
          'Monthly credit reset for plan: ' || p_plan_id);
END;
$$;

-- â”€â”€â”€ Function: get_dashboard_stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Returns aggregate stats for the user dashboard.

CREATE OR REPLACE FUNCTION public.get_dashboard_stats(
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_listings      bigint;
  v_total_poas          bigint;
  v_credits_used_month  bigint;
  v_credits_remaining   integer;
BEGIN
  SELECT COUNT(*)  INTO v_total_listings
    FROM public.listings
   WHERE user_id = p_user_id;

  SELECT COUNT(*)  INTO v_total_poas
    FROM public.poa_requests
   WHERE user_id = p_user_id;

  -- Sum negative (usage) transactions in the current calendar month
  SELECT COALESCE(ABS(SUM(amount)), 0)
    INTO v_credits_used_month
    FROM public.credit_transactions
   WHERE user_id  = p_user_id
     AND type     = 'usage'
     AND created_at >= date_trunc('month', now());

  SELECT credits_remaining INTO v_credits_remaining
    FROM public.profiles
   WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'total_listings',     v_total_listings,
    'total_poas',         v_total_poas,
    'credits_used_month', v_credits_used_month,
    'credits_remaining',  v_credits_remaining
  );
END;
$$;


-- Migration 013: Seed reference data
-- plans, platforms, and top-level categories for Amazon India & Flipkart.
-- Use ON CONFLICT DO UPDATE so reruns are idempotent.

-- â”€â”€â”€ Plans â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO public.plans (id, display_name, monthly_price_inr, credits_per_month, features, razorpay_plan_id)
VALUES
  (
    'free',
    'Free',
    0,
    3,
    '{
      "listing_optimizer": true,
      "poa_generator": false,
      "languages": ["en"],
      "platforms": ["amazon_india"],
      "support": "community"
    }'::jsonb,
    NULL
  ),
  (
    'growth',
    'Growth',
    499,
    10,
    '{
      "listing_optimizer": true,
      "poa_generator": false,
      "languages": ["en", "hi", "bn", "ta", "te", "kn", "mr", "gu"],
      "platforms": ["amazon_india", "flipkart"],
      "support": "email",
      "pdf_export": true,
      "seo_score": true
    }'::jsonb,
    NULL  -- set via RAZORPAY_PLAN_GROWTH env var at runtime
  ),
  (
    'pro',
    'Pro',
    1499,
    50,
    '{
      "listing_optimizer": true,
      "poa_generator": true,
      "languages": ["en", "hi", "bn", "ta", "te", "kn", "mr", "gu"],
      "platforms": ["amazon_india", "flipkart"],
      "support": "priority",
      "pdf_export": true,
      "seo_score": true
    }'::jsonb,
    NULL  -- set via RAZORPAY_PLAN_PRO env var at runtime
  ),
  (
    'agency',
    'Agency',
    4999,
    200,
    '{
      "listing_optimizer": true,
      "poa_generator": true,
      "languages": ["en", "hi", "bn", "ta", "te", "kn", "mr", "gu"],
      "platforms": ["amazon_india", "flipkart"],
      "support": "priority",
      "pdf_export": true,
      "seo_score": true,
      "bulk_upload": true,
      "team_seats": 5
    }'::jsonb,
    NULL  -- set via RAZORPAY_PLAN_AGENCY env var at runtime
  )
ON CONFLICT (id) DO UPDATE SET
  display_name      = EXCLUDED.display_name,
  monthly_price_inr = EXCLUDED.monthly_price_inr,
  credits_per_month = EXCLUDED.credits_per_month,
  features          = EXCLUDED.features;

-- â”€â”€â”€ Platforms â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO public.platforms (id, display_name, base_url, logo_url)
VALUES
  (
    'amazon_india',
    'Amazon India',
    'https://www.amazon.in',
    '/images/platforms/amazon-india.svg'
  ),
  (
    'flipkart',
    'Flipkart',
    'https://www.flipkart.com',
    '/images/platforms/flipkart.svg'
  )
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  base_url     = EXCLUDED.base_url,
  logo_url     = EXCLUDED.logo_url;

-- â”€â”€â”€ Categories: Amazon India â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO public.categories (platform_id, name, slug, sort_order)
VALUES
  ('amazon_india', 'Electronics',                    'electronics',                 1),
  ('amazon_india', 'Computers & Accessories',        'computers-accessories',        2),
  ('amazon_india', 'Mobile Phones',                  'mobile-phones',               3),
  ('amazon_india', 'Home & Kitchen',                 'home-kitchen',                4),
  ('amazon_india', 'Fashion',                        'fashion',                     5),
  ('amazon_india', 'Sports & Fitness',               'sports-fitness',              6),
  ('amazon_india', 'Beauty & Personal Care',         'beauty-personal-care',        7),
  ('amazon_india', 'Books',                          'books',                       8),
  ('amazon_india', 'Toys & Games',                   'toys-games',                  9),
  ('amazon_india', 'Grocery & Gourmet Foods',        'grocery-gourmet-foods',      10),
  ('amazon_india', 'Automotive',                     'automotive',                 11),
  ('amazon_india', 'Health & Personal Care',         'health-personal-care',       12),
  ('amazon_india', 'Industrial & Scientific',        'industrial-scientific',      13),
  ('amazon_india', 'Office Products',                'office-products',            14),
  ('amazon_india', 'Pet Supplies',                   'pet-supplies',               15),
  ('amazon_india', 'Tools & Home Improvement',       'tools-home-improvement',     16),
  ('amazon_india', 'Musical Instruments',            'musical-instruments',        17),
  ('amazon_india', 'Baby Products',                  'baby-products',              18),
  ('amazon_india', 'Luggage & Travel Gear',          'luggage-travel-gear',        19),
  ('amazon_india', 'Watches',                        'watches',                    20)
ON CONFLICT (platform_id, slug) DO UPDATE SET
  name       = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order;

-- â”€â”€â”€ Categories: Flipkart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO public.categories (platform_id, name, slug, sort_order)
VALUES
  ('flipkart', 'Electronics',                 'electronics',                1),
  ('flipkart', 'Mobiles',                     'mobiles',                    2),
  ('flipkart', 'Computers',                   'computers',                  3),
  ('flipkart', 'Home & Furniture',            'home-furniture',             4),
  ('flipkart', 'Fashion',                     'fashion',                    5),
  ('flipkart', 'Sports & Fitness',            'sports-fitness',             6),
  ('flipkart', 'Beauty & Personal Care',      'beauty-personal-care',       7),
  ('flipkart', 'Books',                       'books',                      8),
  ('flipkart', 'Toys & Baby Products',        'toys-baby-products',         9),
  ('flipkart', 'Grocery',                     'grocery',                   10),
  ('flipkart', 'Automotive',                  'automotive',                11),
  ('flipkart', 'Health & Nutrition',          'health-nutrition',          12),
  ('flipkart', 'Office Supplies',             'office-supplies',           13),
  ('flipkart', 'Pet Supplies',                'pet-supplies',              14),
  ('flipkart', 'Kitchen Appliances',          'kitchen-appliances',        15),
  ('flipkart', 'Jewellery',                   'jewellery',                 16),
  ('flipkart', 'Musical Instruments',         'musical-instruments',       17),
  ('flipkart', 'Gaming',                      'gaming',                    18),
  ('flipkart', 'Stationery',                  'stationery',                19),
  ('flipkart', 'Watches & Wearables',         'watches-wearables',         20)
ON CONFLICT (platform_id, slug) DO UPDATE SET
  name       = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order;

