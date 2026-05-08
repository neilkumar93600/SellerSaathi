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
