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
