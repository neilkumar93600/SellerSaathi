-- Migration 009: poa_requests table
-- Also adds FK from credit_transactions.poa_id → poa_requests(id)

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
