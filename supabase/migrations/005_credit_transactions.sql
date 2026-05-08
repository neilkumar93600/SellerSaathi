-- Migration 005: credit_transactions table
-- listing_id and poa_id are nullable FK — added after listings/poa_requests tables exist.
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
