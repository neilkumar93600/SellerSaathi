-- ============================================================
-- 005_credit_transactions.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount        integer NOT NULL, -- positive=added, negative=used
  type          text NOT NULL CHECK (type IN ('purchase','usage','bonus','monthly_reset','refund')),
  description   text,
  listing_id    uuid, -- FK added after listings table created
  poa_id        uuid, -- FK added after poa_requests table created
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);


-- ============================================================
-- 006_platforms.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS public.platforms (
  id            text PRIMARY KEY,
  display_name  text NOT NULL,
  base_url      text,
  logo_url      text,
  is_active     boolean NOT NULL DEFAULT true
);


-- ============================================================
-- 007_categories.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id   text NOT NULL REFERENCES public.platforms(id),
  name          text NOT NULL,
  slug          text NOT NULL,
  parent_id     uuid REFERENCES public.categories(id),
  sort_order    integer NOT NULL DEFAULT 0,
  UNIQUE(platform_id, slug)
);

CREATE INDEX idx_categories_platform_id ON public.categories(platform_id);
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);


-- ============================================================
-- 008_listings.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS public.listings (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform_id                 text NOT NULL REFERENCES public.platforms(id),
  category_id                 uuid REFERENCES public.categories(id),
  -- Input
  input_title                 text NOT NULL,
  input_description           text,
  input_bullets               jsonb NOT NULL DEFAULT '[]',
  input_specs                 jsonb NOT NULL DEFAULT '{}',
  input_keywords              text,
  output_language             text NOT NULL DEFAULT 'en',
  -- Output
  optimized_title             text,
  optimized_description       text,
  optimized_bullets           jsonb,
  optimized_backend_keywords  text,
  flipkart_highlights         jsonb,
  flipkart_tags               text,
  seo_score_before            integer,
  seo_score_after             integer,
  improvements                jsonb,
  -- Meta
  status                      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  credits_used                integer NOT NULL DEFAULT 1,
  error_message               text,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_listings_user_id ON public.listings(user_id);
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX idx_listings_status ON public.listings(status);

CREATE TRIGGER listings_updated_at BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Add FK from credit_transactions
ALTER TABLE public.credit_transactions
  ADD CONSTRAINT fk_credit_listing FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE SET NULL;


-- ============================================================
-- 009_poa_requests.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS public.poa_requests (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform_id             text NOT NULL REFERENCES public.platforms(id),
  asin_or_listing_id      text NOT NULL,
  suspension_reason       text NOT NULL,
  suspension_notice_text  text,
  suspension_notice_url   text,
  generated_poa           text,
  poa_version             integer NOT NULL DEFAULT 1,
  status                  text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  credits_used            integer NOT NULL DEFAULT 2,
  error_message           text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_poa_requests_user_id ON public.poa_requests(user_id);
CREATE INDEX idx_poa_requests_created_at ON public.poa_requests(created_at DESC);

CREATE TRIGGER poa_requests_updated_at BEFORE UPDATE ON public.poa_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.credit_transactions
  ADD CONSTRAINT fk_credit_poa FOREIGN KEY (poa_id) REFERENCES public.poa_requests(id) ON DELETE SET NULL;


-- ============================================================
-- 010_payments.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type                  text NOT NULL CHECK (type IN ('subscription','credits')),
  plan_id               text REFERENCES public.plans(id),
  credits_purchased     integer,
  amount_inr            integer NOT NULL,
  razorpay_order_id     text UNIQUE,
  razorpay_payment_id   text UNIQUE,
  razorpay_signature    text,
  razorpay_subscription_id text,
  status                text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','captured','failed','refunded')),
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_razorpay_order ON public.payments(razorpay_order_id);
