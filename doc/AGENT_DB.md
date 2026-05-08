# AGENT_DB — Database & Supabase Agent

**Read:** This file + `ARCHITECTURE.md` only. Do not read other agent files.

---

## Role
You own everything database-related. You write SQL migrations, define RLS policies, create DB functions/triggers, and generate TypeScript types from the schema.

## Files You Own
```
supabase/migrations/001_extensions.sql
supabase/migrations/002_profiles.sql
supabase/migrations/003_plans.sql
supabase/migrations/004_subscriptions.sql
supabase/migrations/005_credit_transactions.sql
supabase/migrations/006_platforms.sql
supabase/migrations/007_categories.sql
supabase/migrations/008_listings.sql
supabase/migrations/009_poa_requests.sql
supabase/migrations/010_payments.sql
supabase/migrations/011_rls_policies.sql
supabase/migrations/012_functions_triggers.sql
supabase/migrations/013_seed_data.sql
src/types/database.types.ts
```

## Do NOT Touch
- Any file in `src/app/`, `src/components/`, `src/hooks/`, `src/lib/`, `src/stores/`

---

## Schema Reference

### Table: profiles
```sql
id uuid PK FK auth.users(id)
email text NOT NULL
full_name text
avatar_url text
plan text DEFAULT 'free' CHECK (free|pro|agency)
credits_remaining integer DEFAULT 3
language_preference text DEFAULT 'en'
primary_platform text DEFAULT 'amazon_india'
created_at timestamptz DEFAULT now()
updated_at timestamptz DEFAULT now()
```

### Table: plans
```sql
id text PK  -- 'free'|'pro'|'agency'
display_name text NOT NULL
monthly_price_inr integer NOT NULL
credits_per_month integer NOT NULL
features jsonb NOT NULL
razorpay_plan_id text
```

### Table: subscriptions
```sql
id uuid PK DEFAULT gen_random_uuid()
user_id uuid FK profiles(id)
plan_id text FK plans(id)
status text DEFAULT 'active' CHECK (active|cancelled|past_due|trialing)
razorpay_subscription_id text UNIQUE
razorpay_customer_id text
current_period_start timestamptz
current_period_end timestamptz
cancel_at_period_end boolean DEFAULT false
created_at timestamptz DEFAULT now()
updated_at timestamptz DEFAULT now()
```

### Table: credit_transactions
```sql
id uuid PK DEFAULT gen_random_uuid()
user_id uuid FK profiles(id)
amount integer NOT NULL  -- positive=added, negative=used
type text CHECK (purchase|usage|bonus|monthly_reset|refund)
description text
listing_id uuid NULLABLE FK listings(id)
poa_id uuid NULLABLE FK poa_requests(id)
created_at timestamptz DEFAULT now()
```

### Table: platforms
```sql
id text PK  -- 'amazon_india'|'flipkart'
display_name text NOT NULL
base_url text
logo_url text
```

### Table: categories
```sql
id uuid PK DEFAULT gen_random_uuid()
platform_id text FK platforms(id)
name text NOT NULL
slug text NOT NULL
parent_id uuid NULLABLE FK categories(id)
sort_order integer DEFAULT 0
```

### Table: listings
```sql
id uuid PK DEFAULT gen_random_uuid()
user_id uuid FK profiles(id)
platform_id text FK platforms(id)
category_id uuid NULLABLE FK categories(id)
-- Input fields
input_title text
input_description text
input_bullets jsonb  -- array of strings
input_specs jsonb    -- key-value pairs
input_keywords text  -- optional target keywords
output_language text DEFAULT 'en'
-- Output fields
optimized_title text
optimized_description text
optimized_bullets jsonb
optimized_backend_keywords text
seo_score_before integer
seo_score_after integer
-- Meta
status text DEFAULT 'pending' CHECK (pending|processing|completed|failed)
credits_used integer DEFAULT 1
error_message text
created_at timestamptz DEFAULT now()
updated_at timestamptz DEFAULT now()
```

### Table: poa_requests
```sql
id uuid PK DEFAULT gen_random_uuid()
user_id uuid FK profiles(id)
platform_id text FK platforms(id)
asin_or_listing_id text
suspension_reason text
suspension_notice_text text
suspension_notice_url text  -- Supabase Storage path
generated_poa text
poa_version integer DEFAULT 1
status text DEFAULT 'pending' CHECK (pending|processing|completed|failed)
credits_used integer DEFAULT 2
error_message text
created_at timestamptz DEFAULT now()
updated_at timestamptz DEFAULT now()
```

### Table: payments
```sql
id uuid PK DEFAULT gen_random_uuid()
user_id uuid FK profiles(id)
type text CHECK (subscription|credits)
plan_id text NULLABLE FK plans(id)
credits_purchased integer NULLABLE
amount_inr integer NOT NULL
razorpay_order_id text UNIQUE
razorpay_payment_id text UNIQUE
razorpay_signature text
status text DEFAULT 'pending' CHECK (pending|captured|failed|refunded)
created_at timestamptz DEFAULT now()
```

---

## RLS Policy Rules

**profiles:** user reads/updates own row only. Service role bypasses.

**subscriptions:** user reads own. Only service role inserts/updates.

**credit_transactions:** user reads own. Only service role inserts.

**listings:** user CRUD own rows only.

**poa_requests:** user CRUD own rows only.

**payments:** user reads own. Only service role inserts/updates.

**plans, platforms, categories:** public read, no write from client.

---

## Key DB Functions

```sql
-- Deduct credits atomically (use in API routes via RPC)
get_credits_and_deduct(p_user_id uuid, p_amount integer)
  → returns: { success bool, credits_remaining int, error text }

-- Monthly credit reset (called by cron/trigger on subscription renewal)
reset_monthly_credits(p_user_id uuid, p_plan_id text)
  → updates profiles.credits_remaining to plan's credits_per_month

-- Get user dashboard stats
get_dashboard_stats(p_user_id uuid)
  → returns: { total_listings, total_poas, credits_used_month, credits_remaining }
```

---

## TypeScript Types Pattern (database.types.ts)

```typescript
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: ProfileInsert; Update: ProfileUpdate }
      listings: { Row: Listing; Insert: ListingInsert; Update: ListingUpdate }
      // ... all tables
    }
    Functions: {
      get_credits_and_deduct: { Args: {...}; Returns: {...} }
      get_dashboard_stats: { Args: {...}; Returns: {...} }
    }
    Enums: {
      plan_type: 'free' | 'pro' | 'agency'
      listing_status: 'pending' | 'processing' | 'completed' | 'failed'
      poa_status: 'pending' | 'processing' | 'completed' | 'failed'
      platform_id: 'amazon_india' | 'flipkart'
    }
  }
}
```

---

## Migration Order (STRICT — run 001→013 in sequence)

1. `001_extensions` — enable uuid-ossp, pgcrypto
2. `002_profiles` — profiles table + trigger on auth.users insert
3. `003_plans` — plans reference table
4. `004_subscriptions` — subscriptions table
5. `005_credit_transactions` — credit_transactions table
6. `006_platforms` — platforms table
7. `007_categories` — categories table
8. `008_listings` — listings table
9. `009_poa_requests` — poa_requests table
10. `010_payments` — payments table
11. `011_rls_policies` — ALL RLS policies in one file
12. `012_functions_triggers` — DB functions + triggers
13. `013_seed_data` — plans, platforms, categories seed data
