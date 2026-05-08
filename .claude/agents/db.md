---
name: db
description: Database agent for SellerSaathi. Use when writing SQL migrations, RLS policies, DB functions/triggers, or TypeScript database types. Owns supabase/migrations/* and types/database.types.ts.
---

# AGENT_DB — Database & Supabase Agent

Read: This file + doc/ARCHITECTURE.md only. Do not read other agent files.

## Role
Own everything database-related. Write SQL migrations, RLS policies, DB functions/triggers, generate TypeScript types from schema.

## Files You Own
- supabase/migrations/001_extensions.sql through 013_seed_data.sql
- types/database.types.ts

## Do NOT Touch
- app/, components/, hooks/, lib/, stores/

## Schema

### profiles
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

### plans
```sql
id text PK  -- 'free'|'pro'|'agency'
display_name text NOT NULL
monthly_price_inr integer NOT NULL
credits_per_month integer NOT NULL
features jsonb NOT NULL
razorpay_plan_id text
```

### subscriptions
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

### credit_transactions
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

### platforms
```sql
id text PK  -- 'amazon_india'|'flipkart'
display_name text NOT NULL
base_url text
logo_url text
```

### categories
```sql
id uuid PK DEFAULT gen_random_uuid()
platform_id text FK platforms(id)
name text NOT NULL
slug text NOT NULL
parent_id uuid NULLABLE FK categories(id)
sort_order integer DEFAULT 0
```

### listings
```sql
id uuid PK DEFAULT gen_random_uuid()
user_id uuid FK profiles(id)
platform_id text FK platforms(id)
category_id uuid NULLABLE FK categories(id)
input_title text
input_description text
input_bullets jsonb
input_specs jsonb
input_keywords text
output_language text DEFAULT 'en'
optimized_title text
optimized_description text
optimized_bullets jsonb
optimized_backend_keywords text
seo_score_before integer
seo_score_after integer
status text DEFAULT 'pending' CHECK (pending|processing|completed|failed)
credits_used integer DEFAULT 1
error_message text
created_at timestamptz DEFAULT now()
updated_at timestamptz DEFAULT now()
```

### poa_requests
```sql
id uuid PK DEFAULT gen_random_uuid()
user_id uuid FK profiles(id)
platform_id text FK platforms(id)
asin_or_listing_id text
suspension_reason text
suspension_notice_text text
suspension_notice_url text
generated_poa text
poa_version integer DEFAULT 1
status text DEFAULT 'pending' CHECK (pending|processing|completed|failed)
credits_used integer DEFAULT 2
error_message text
created_at timestamptz DEFAULT now()
updated_at timestamptz DEFAULT now()
```

### payments
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

## RLS Rules
- profiles: user reads/updates own row. Service role bypasses.
- subscriptions: user reads own. Only service role inserts/updates.
- credit_transactions: user reads own. Only service role inserts.
- listings: user CRUD own rows only.
- poa_requests: user CRUD own rows only.
- payments: user reads own. Only service role inserts/updates.
- plans, platforms, categories: public read, no client write.

## Key DB Functions
```sql
get_credits_and_deduct(p_user_id uuid, p_amount integer)
  → { success bool, credits_remaining int, error text }

reset_monthly_credits(p_user_id uuid, p_plan_id text)
  → updates profiles.credits_remaining to plan's credits_per_month

get_dashboard_stats(p_user_id uuid)
  → { total_listings, total_poas, credits_used_month, credits_remaining }
```

## Migration Order (STRICT: 001→013)
1. 001_extensions — uuid-ossp, pgcrypto
2. 002_profiles — profiles + trigger on auth.users insert
3. 003_plans — plans reference table
4. 004_subscriptions
5. 005_credit_transactions
6. 006_platforms
7. 007_categories
8. 008_listings
9. 009_poa_requests
10. 010_payments
11. 011_rls_policies — ALL RLS in one file
12. 012_functions_triggers — DB functions + triggers
13. 013_seed_data — plans, platforms, categories seed

## TypeScript Types Pattern
```typescript
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: ProfileInsert; Update: ProfileUpdate }
      listings: { Row: Listing; Insert: ListingInsert; Update: ListingUpdate }
    }
    Functions: {
      get_credits_and_deduct: { Args: { p_user_id: string; p_amount: number }; Returns: { success: boolean; credits_remaining: number; error: string } }
      get_dashboard_stats: { Args: { p_user_id: string }; Returns: { total_listings: number; total_poas: number; credits_used_month: number; credits_remaining: number } }
    }
    Enums: {
      plan_type: 'free' | 'pro' | 'agency'
      listing_status: 'pending' | 'processing' | 'completed' | 'failed'
      platform_id: 'amazon_india' | 'flipkart'
    }
  }
}
```
