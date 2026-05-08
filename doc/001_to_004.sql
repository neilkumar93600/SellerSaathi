-- ============================================================
-- 001_extensions.sql
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- 002_profiles.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         text NOT NULL,
  full_name     text,
  avatar_url    text,
  plan          text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro','agency')),
  credits_remaining integer NOT NULL DEFAULT 3,
  language_preference text NOT NULL DEFAULT 'en' CHECK (language_preference IN ('en','hi','bn','ta','te','kn','mr','gu')),
  primary_platform text DEFAULT 'amazon_india' CHECK (primary_platform IN ('amazon_india','flipkart')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ============================================================
-- 003_plans.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS public.plans (
  id                  text PRIMARY KEY,
  display_name        text NOT NULL,
  monthly_price_inr   integer NOT NULL DEFAULT 0,
  credits_per_month   integer NOT NULL,
  features            jsonb NOT NULL DEFAULT '[]',
  razorpay_plan_id    text,
  is_active           boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
-- 004_subscriptions.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id                     text NOT NULL REFERENCES public.plans(id),
  status                      text NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled','past_due','trialing')),
  razorpay_subscription_id    text UNIQUE,
  razorpay_customer_id        text,
  current_period_start        timestamptz,
  current_period_end          timestamptz,
  cancel_at_period_end        boolean NOT NULL DEFAULT false,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
