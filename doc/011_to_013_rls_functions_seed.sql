-- ============================================================
-- 011_rls_policies.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poa_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- ---- profiles ----
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ---- subscriptions ----
CREATE POLICY "subscriptions_select_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- ---- credit_transactions ----
CREATE POLICY "credits_select_own" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);

-- ---- listings ----
CREATE POLICY "listings_select_own" ON public.listings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "listings_insert_own" ON public.listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "listings_update_own" ON public.listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "listings_delete_own" ON public.listings FOR DELETE USING (auth.uid() = user_id);

-- ---- poa_requests ----
CREATE POLICY "poa_select_own" ON public.poa_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "poa_insert_own" ON public.poa_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "poa_update_own" ON public.poa_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "poa_delete_own" ON public.poa_requests FOR DELETE USING (auth.uid() = user_id);

-- ---- payments ----
CREATE POLICY "payments_select_own" ON public.payments FOR SELECT USING (auth.uid() = user_id);

-- ---- plans (public read) ----
CREATE POLICY "plans_public_read" ON public.plans FOR SELECT USING (true);

-- ---- platforms (public read) ----
CREATE POLICY "platforms_public_read" ON public.platforms FOR SELECT USING (true);

-- ---- categories (public read) ----
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (true);


-- ============================================================
-- 012_functions_triggers.sql
-- ============================================================

-- Atomic credit deduction with race condition protection
CREATE OR REPLACE FUNCTION public.get_credits_and_deduct(
  p_user_id uuid,
  p_amount integer
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_credits integer;
BEGIN
  SELECT credits_remaining INTO v_credits
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;  -- row-level lock

  IF v_credits IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'user_not_found', 'credits_remaining', 0);
  END IF;

  IF v_credits < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_credits', 'credits_remaining', v_credits);
  END IF;

  UPDATE public.profiles
  SET credits_remaining = credits_remaining - p_amount
  WHERE id = p_user_id;

  RETURN jsonb_build_object('success', true, 'error', null, 'credits_remaining', v_credits - p_amount);
END;
$$;

-- Monthly credit reset on subscription renewal
CREATE OR REPLACE FUNCTION public.reset_monthly_credits(
  p_user_id uuid,
  p_plan_id text
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_credits integer;
BEGIN
  SELECT credits_per_month INTO v_credits FROM public.plans WHERE id = p_plan_id;

  UPDATE public.profiles
  SET credits_remaining = v_credits
  WHERE id = p_user_id;

  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, v_credits, 'monthly_reset', 'Monthly credit reset for ' || p_plan_id || ' plan');
END;
$$;

-- Dashboard stats aggregation
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(p_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_total_listings integer;
  v_total_poas integer;
  v_credits_used_month integer;
  v_credits_remaining integer;
BEGIN
  SELECT COUNT(*) INTO v_total_listings FROM public.listings WHERE user_id = p_user_id AND status = 'completed';
  SELECT COUNT(*) INTO v_total_poas FROM public.poa_requests WHERE user_id = p_user_id AND status = 'completed';
  SELECT credits_remaining INTO v_credits_remaining FROM public.profiles WHERE id = p_user_id;
  SELECT COALESCE(ABS(SUM(amount)), 0) INTO v_credits_used_month
  FROM public.credit_transactions
  WHERE user_id = p_user_id AND type = 'usage'
    AND created_at >= date_trunc('month', now());

  RETURN jsonb_build_object(
    'total_listings', v_total_listings,
    'total_poas', v_total_poas,
    'credits_used_month', v_credits_used_month,
    'credits_remaining', v_credits_remaining
  );
END;
$$;

-- Add credits to user (used in webhook + verify routes via service role)
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id uuid,
  p_amount integer,
  p_type text,
  p_description text
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles SET credits_remaining = credits_remaining + p_amount WHERE id = p_user_id;
  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, p_amount, p_type, p_description);
END;
$$;


-- ============================================================
-- 013_seed_data.sql
-- ============================================================

-- Plans
INSERT INTO public.plans (id, display_name, monthly_price_inr, credits_per_month, features) VALUES
('free', 'Free', 0, 3, '["3 lifetime credits","Listing optimizer only","English only","Watermarked PDF"]'),
('pro', 'Pro', 999, 30, '["30 credits/month","Listing optimizer","POA Generator","All 8 languages","Clean PDF export","Priority AI"]'),
('agency', 'Agency', 2499, 100, '["100 credits/month","All Pro features","Bulk CSV upload (coming soon)","API access (coming soon)","Priority support"]')
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  monthly_price_inr = EXCLUDED.monthly_price_inr,
  credits_per_month = EXCLUDED.credits_per_month,
  features = EXCLUDED.features;

-- Platforms
INSERT INTO public.platforms (id, display_name, base_url) VALUES
('amazon_india', 'Amazon India', 'https://www.amazon.in'),
('flipkart', 'Flipkart', 'https://www.flipkart.com')
ON CONFLICT (id) DO NOTHING;

-- Amazon India Categories (top level)
INSERT INTO public.categories (platform_id, name, slug, sort_order) VALUES
('amazon_india', 'Electronics', 'electronics', 1),
('amazon_india', 'Clothing', 'clothing', 2),
('amazon_india', 'Home & Kitchen', 'home-kitchen', 3),
('amazon_india', 'Books', 'books', 4),
('amazon_india', 'Sports & Outdoors', 'sports-outdoors', 5),
('amazon_india', 'Beauty & Personal Care', 'beauty-personal-care', 6),
('amazon_india', 'Toys & Games', 'toys-games', 7),
('amazon_india', 'Grocery & Gourmet Foods', 'grocery-gourmet', 8),
('amazon_india', 'Automotive', 'automotive', 9),
('amazon_india', 'Health & Personal Care', 'health-personal-care', 10),
('amazon_india', 'Office Products', 'office-products', 11),
('amazon_india', 'Pet Supplies', 'pet-supplies', 12),
('amazon_india', 'Musical Instruments', 'musical-instruments', 13),
('amazon_india', 'Industrial & Scientific', 'industrial-scientific', 14),
('amazon_india', 'Baby Products', 'baby-products', 15),
('amazon_india', 'Jewelry', 'jewelry', 16),
('amazon_india', 'Watches', 'watches', 17),
('amazon_india', 'Shoes & Handbags', 'shoes-handbags', 18),
('amazon_india', 'Garden & Outdoors', 'garden-outdoors', 19),
('amazon_india', 'Luggage & Bags', 'luggage-bags', 20)
ON CONFLICT (platform_id, slug) DO NOTHING;

-- Flipkart Categories
INSERT INTO public.categories (platform_id, name, slug, sort_order) VALUES
('flipkart', 'Electronics', 'electronics', 1),
('flipkart', 'Clothing', 'clothing', 2),
('flipkart', 'Home & Furniture', 'home-furniture', 3),
('flipkart', 'Books', 'books', 4),
('flipkart', 'Sports & Fitness', 'sports-fitness', 5),
('flipkart', 'Beauty & Health', 'beauty-health', 6),
('flipkart', 'Toys & Baby Products', 'toys-baby', 7),
('flipkart', 'Grocery', 'grocery', 8),
('flipkart', 'Automotive', 'automotive', 9),
('flipkart', 'Appliances', 'appliances', 10),
('flipkart', 'Mobiles', 'mobiles', 11),
('flipkart', 'TVs & Appliances', 'tv-appliances', 12),
('flipkart', 'Cameras', 'cameras', 13),
('flipkart', 'Computers', 'computers', 14),
('flipkart', 'Jewellery', 'jewellery', 15),
('flipkart', 'Footwear', 'footwear', 16),
('flipkart', 'Bags & Luggage', 'bags-luggage', 17),
('flipkart', 'Office Stationery', 'office-stationery', 18)
ON CONFLICT (platform_id, slug) DO NOTHING;
