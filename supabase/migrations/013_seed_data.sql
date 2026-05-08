-- Migration 013: Seed reference data
-- plans, platforms, and top-level categories for Amazon India & Flipkart.
-- Use ON CONFLICT DO UPDATE so reruns are idempotent.

-- ─── Plans ───────────────────────────────────────────────────────────────────
INSERT INTO public.plans (id, display_name, monthly_price_inr, credits_per_month, features, razorpay_plan_id)
VALUES
  (
    'free',
    'Free',
    0,
    3,
    '{
      "listing_optimizer": true,
      "poa_generator": false,
      "languages": ["en"],
      "platforms": ["amazon_india"],
      "support": "community"
    }'::jsonb,
    NULL
  ),
  (
    'pro',
    'Pro',
    999,
    50,
    '{
      "listing_optimizer": true,
      "poa_generator": true,
      "languages": ["en", "hi", "bn", "ta", "te", "kn", "mr", "gu"],
      "platforms": ["amazon_india", "flipkart"],
      "support": "email",
      "pdf_export": true,
      "seo_score": true
    }'::jsonb,
    NULL  -- set via RAZORPAY_PLAN_PRO env var at runtime
  ),
  (
    'agency',
    'Agency',
    2499,
    200,
    '{
      "listing_optimizer": true,
      "poa_generator": true,
      "languages": ["en", "hi", "bn", "ta", "te", "kn", "mr", "gu"],
      "platforms": ["amazon_india", "flipkart"],
      "support": "priority",
      "pdf_export": true,
      "seo_score": true,
      "bulk_upload": true,
      "team_seats": 5
    }'::jsonb,
    NULL  -- set via RAZORPAY_PLAN_AGENCY env var at runtime
  )
ON CONFLICT (id) DO UPDATE SET
  display_name      = EXCLUDED.display_name,
  monthly_price_inr = EXCLUDED.monthly_price_inr,
  credits_per_month = EXCLUDED.credits_per_month,
  features          = EXCLUDED.features;

-- ─── Platforms ───────────────────────────────────────────────────────────────
INSERT INTO public.platforms (id, display_name, base_url, logo_url)
VALUES
  (
    'amazon_india',
    'Amazon India',
    'https://www.amazon.in',
    '/images/platforms/amazon-india.svg'
  ),
  (
    'flipkart',
    'Flipkart',
    'https://www.flipkart.com',
    '/images/platforms/flipkart.svg'
  )
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  base_url     = EXCLUDED.base_url,
  logo_url     = EXCLUDED.logo_url;

-- ─── Categories: Amazon India ─────────────────────────────────────────────────
INSERT INTO public.categories (platform_id, name, slug, sort_order)
VALUES
  ('amazon_india', 'Electronics',                    'electronics',                 1),
  ('amazon_india', 'Computers & Accessories',        'computers-accessories',        2),
  ('amazon_india', 'Mobile Phones',                  'mobile-phones',               3),
  ('amazon_india', 'Home & Kitchen',                 'home-kitchen',                4),
  ('amazon_india', 'Fashion',                        'fashion',                     5),
  ('amazon_india', 'Sports & Fitness',               'sports-fitness',              6),
  ('amazon_india', 'Beauty & Personal Care',         'beauty-personal-care',        7),
  ('amazon_india', 'Books',                          'books',                       8),
  ('amazon_india', 'Toys & Games',                   'toys-games',                  9),
  ('amazon_india', 'Grocery & Gourmet Foods',        'grocery-gourmet-foods',      10),
  ('amazon_india', 'Automotive',                     'automotive',                 11),
  ('amazon_india', 'Health & Personal Care',         'health-personal-care',       12),
  ('amazon_india', 'Industrial & Scientific',        'industrial-scientific',      13),
  ('amazon_india', 'Office Products',                'office-products',            14),
  ('amazon_india', 'Pet Supplies',                   'pet-supplies',               15),
  ('amazon_india', 'Tools & Home Improvement',       'tools-home-improvement',     16),
  ('amazon_india', 'Musical Instruments',            'musical-instruments',        17),
  ('amazon_india', 'Baby Products',                  'baby-products',              18),
  ('amazon_india', 'Luggage & Travel Gear',          'luggage-travel-gear',        19),
  ('amazon_india', 'Watches',                        'watches',                    20)
ON CONFLICT (platform_id, slug) DO UPDATE SET
  name       = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order;

-- ─── Categories: Flipkart ────────────────────────────────────────────────────
INSERT INTO public.categories (platform_id, name, slug, sort_order)
VALUES
  ('flipkart', 'Electronics',                 'electronics',                1),
  ('flipkart', 'Mobiles',                     'mobiles',                    2),
  ('flipkart', 'Computers',                   'computers',                  3),
  ('flipkart', 'Home & Furniture',            'home-furniture',             4),
  ('flipkart', 'Fashion',                     'fashion',                    5),
  ('flipkart', 'Sports & Fitness',            'sports-fitness',             6),
  ('flipkart', 'Beauty & Personal Care',      'beauty-personal-care',       7),
  ('flipkart', 'Books',                       'books',                      8),
  ('flipkart', 'Toys & Baby Products',        'toys-baby-products',         9),
  ('flipkart', 'Grocery',                     'grocery',                   10),
  ('flipkart', 'Automotive',                  'automotive',                11),
  ('flipkart', 'Health & Nutrition',          'health-nutrition',          12),
  ('flipkart', 'Office Supplies',             'office-supplies',           13),
  ('flipkart', 'Pet Supplies',                'pet-supplies',              14),
  ('flipkart', 'Kitchen Appliances',          'kitchen-appliances',        15),
  ('flipkart', 'Jewellery',                   'jewellery',                 16),
  ('flipkart', 'Musical Instruments',         'musical-instruments',       17),
  ('flipkart', 'Gaming',                      'gaming',                    18),
  ('flipkart', 'Stationery',                  'stationery',                19),
  ('flipkart', 'Watches & Wearables',         'watches-wearables',         20)
ON CONFLICT (platform_id, slug) DO UPDATE SET
  name       = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order;
