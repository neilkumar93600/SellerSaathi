-- Migration 012: DB functions & triggers
-- All functions are SECURITY DEFINER so they run with owner privileges
-- (bypassing RLS), making them safe to call via authenticated RPC.

-- ─── Helper: set_updated_at ──────────────────────────────────────────────────
-- (already created in 002_profiles.sql; skip if re-running)

-- ─── Function: get_credits_and_deduct ────────────────────────────────────────
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

-- ─── Function: reset_monthly_credits ─────────────────────────────────────────
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

-- ─── Function: get_dashboard_stats ───────────────────────────────────────────
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
