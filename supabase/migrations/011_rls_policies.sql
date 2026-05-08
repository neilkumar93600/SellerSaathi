-- Migration 011: Row Level Security policies for all tables
-- Enable RLS first, then define policies.
-- Service role always bypasses RLS; these policies govern anon/authenticated roles.

-- ─── profiles ────────────────────────────────────────────────────────────────
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

-- ─── plans ───────────────────────────────────────────────────────────────────
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plans: public read"
  ON public.plans FOR SELECT
  TO anon, authenticated
  USING (true);

-- ─── subscriptions ───────────────────────────────────────────────────────────
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions: user reads own"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT / UPDATE only via service role (API routes using admin client)

-- ─── credit_transactions ─────────────────────────────────────────────────────
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credit_transactions: user reads own"
  ON public.credit_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT only via service role

-- ─── platforms ───────────────────────────────────────────────────────────────
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platforms: public read"
  ON public.platforms FOR SELECT
  TO anon, authenticated
  USING (true);

-- ─── categories ──────────────────────────────────────────────────────────────
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories: public read"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- ─── listings ────────────────────────────────────────────────────────────────
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

-- ─── poa_requests ────────────────────────────────────────────────────────────
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

-- ─── payments ────────────────────────────────────────────────────────────────
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments: user reads own"
  ON public.payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT / UPDATE only via service role
