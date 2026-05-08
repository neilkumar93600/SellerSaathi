-- Migration 008: listings table
-- Also adds FK from credit_transactions.listing_id → listings(id)

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
