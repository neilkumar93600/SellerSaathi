/**
 * database.types.ts
 * Full TypeScript types for the SellerSaathi Supabase schema.
 * Keep in sync with supabase/migrations/*.sql
 */

// ─── Primitive enums ─────────────────────────────────────────────────────────

export type PlanId = 'free' | 'pro' | 'agency'
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing'
export type CreditTransactionType = 'purchase' | 'usage' | 'bonus' | 'monthly_reset' | 'refund'
export type PlatformId = 'amazon_india' | 'flipkart'
export type ListingStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type PoaStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type PaymentType = 'subscription' | 'credits'
export type PaymentStatus = 'pending' | 'captured' | 'failed' | 'refunded'

// ─── Row types ────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  plan: PlanId
  credits_remaining: number
  language_preference: string
  primary_platform: PlatformId
  created_at: string
  updated_at: string
}

export interface Plan {
  id: PlanId
  display_name: string
  monthly_price_inr: number
  credits_per_month: number
  features: PlanFeatures
  razorpay_plan_id: string | null
}

export interface PlanFeatures {
  listing_optimizer: boolean
  poa_generator: boolean
  languages: string[]
  platforms: PlatformId[]
  support: 'community' | 'email' | 'priority'
  pdf_export?: boolean
  seo_score?: boolean
  bulk_upload?: boolean
  team_seats?: number
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: PlanId
  status: SubscriptionStatus
  razorpay_subscription_id: string | null
  razorpay_customer_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  type: CreditTransactionType
  description: string | null
  listing_id: string | null
  poa_id: string | null
  created_at: string
}

export interface Platform {
  id: PlatformId
  display_name: string
  base_url: string | null
  logo_url: string | null
}

export interface Category {
  id: string
  platform_id: PlatformId
  name: string
  slug: string
  parent_id: string | null
  sort_order: number
}

export interface Listing {
  id: string
  user_id: string
  platform_id: PlatformId
  category_id: string | null
  // Input
  input_title: string | null
  input_description: string | null
  input_bullets: string[] | null
  input_specs: Record<string, string> | null
  input_keywords: string | null
  output_language: string
  // Output
  optimized_title: string | null
  optimized_description: string | null
  optimized_bullets: string[] | null
  optimized_backend_keywords: string | null
  seo_score_before: number | null
  seo_score_after: number | null
  // Meta
  status: ListingStatus
  credits_used: number
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface PoaRequest {
  id: string
  user_id: string
  platform_id: PlatformId
  asin_or_listing_id: string | null
  suspension_reason: string | null
  suspension_notice_text: string | null
  suspension_notice_url: string | null
  generated_poa: string | null
  poa_version: number
  status: PoaStatus
  credits_used: number
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  type: PaymentType
  plan_id: PlanId | null
  credits_purchased: number | null
  amount_inr: number
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  razorpay_signature: string | null
  status: PaymentStatus
  created_at: string
}

// ─── Insert types (omit server-generated fields) ──────────────────────────────

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'> &
  Partial<Pick<Profile, 'plan' | 'credits_remaining' | 'language_preference' | 'primary_platform'>>

export type ProfileUpdate = Partial<
  Pick<Profile, 'full_name' | 'avatar_url' | 'plan' | 'credits_remaining' | 'language_preference' | 'primary_platform'>
>

export type PlanInsert = Plan
export type PlanUpdate = Partial<Omit<Plan, 'id'>>

export type SubscriptionInsert = Omit<Subscription, 'id' | 'created_at' | 'updated_at'> &
  Partial<Pick<Subscription, 'status' | 'cancel_at_period_end'>>

export type SubscriptionUpdate = Partial<
  Pick<Subscription, 'status' | 'razorpay_subscription_id' | 'razorpay_customer_id' | 'current_period_start' | 'current_period_end' | 'cancel_at_period_end'>
>

export type CreditTransactionInsert = Omit<CreditTransaction, 'id' | 'created_at'> &
  Partial<Pick<CreditTransaction, 'description' | 'listing_id' | 'poa_id'>>

export type PlatformInsert = Platform
export type PlatformUpdate = Partial<Omit<Platform, 'id'>>

export type CategoryInsert = Omit<Category, 'id'> & Partial<Pick<Category, 'sort_order' | 'parent_id'>>
export type CategoryUpdate = Partial<Omit<Category, 'id'>>

export type ListingInsert = Omit<Listing, 'id' | 'created_at' | 'updated_at'> &
  Partial<Pick<Listing, 'status' | 'credits_used' | 'output_language' |
    'input_bullets' | 'input_specs' | 'input_keywords' | 'category_id' |
    'optimized_title' | 'optimized_description' | 'optimized_bullets' |
    'optimized_backend_keywords' | 'seo_score_before' | 'seo_score_after' | 'error_message'>>

export type ListingUpdate = Partial<
  Pick<Listing, 'status' | 'optimized_title' | 'optimized_description' | 'optimized_bullets' |
    'optimized_backend_keywords' | 'seo_score_before' | 'seo_score_after' | 'error_message' |
    'credits_used' | 'category_id' | 'output_language'>>

export type PoaRequestInsert = Omit<PoaRequest, 'id' | 'created_at' | 'updated_at'> &
  Partial<Pick<PoaRequest, 'status' | 'credits_used' | 'poa_version' |
    'asin_or_listing_id' | 'suspension_reason' | 'suspension_notice_text' |
    'suspension_notice_url' | 'generated_poa' | 'error_message'>>

export type PoaRequestUpdate = Partial<
  Pick<PoaRequest, 'status' | 'generated_poa' | 'poa_version' | 'error_message' |
    'suspension_notice_url' | 'credits_used'>>

export type PaymentInsert = Omit<Payment, 'id' | 'created_at'> &
  Partial<Pick<Payment, 'status' | 'plan_id' | 'credits_purchased' |
    'razorpay_order_id' | 'razorpay_payment_id' | 'razorpay_signature'>>

export type PaymentUpdate = Partial<
  Pick<Payment, 'status' | 'razorpay_payment_id' | 'razorpay_signature'>>

// ─── Function return types ────────────────────────────────────────────────────

export interface GetCreditsAndDeductResult {
  success: boolean
  credits_remaining: number
  error: string | null
}

export interface GetDashboardStatsResult {
  total_listings: number
  total_poas: number
  credits_used_month: number
  credits_remaining: number
}

// ─── Supabase Database type (used with createClient<Database>()) ──────────────

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      plans: {
        Row: Plan
        Insert: PlanInsert
        Update: PlanUpdate
      }
      subscriptions: {
        Row: Subscription
        Insert: SubscriptionInsert
        Update: SubscriptionUpdate
      }
      credit_transactions: {
        Row: CreditTransaction
        Insert: CreditTransactionInsert
        Update: Partial<CreditTransaction>
      }
      platforms: {
        Row: Platform
        Insert: PlatformInsert
        Update: PlatformUpdate
      }
      categories: {
        Row: Category
        Insert: CategoryInsert
        Update: CategoryUpdate
      }
      listings: {
        Row: Listing
        Insert: ListingInsert
        Update: ListingUpdate
      }
      poa_requests: {
        Row: PoaRequest
        Insert: PoaRequestInsert
        Update: PoaRequestUpdate
      }
      payments: {
        Row: Payment
        Insert: PaymentInsert
        Update: PaymentUpdate
      }
    }
    Views: Record<string, never>
    Functions: {
      get_credits_and_deduct: {
        Args: { p_user_id: string; p_amount: number }
        Returns: GetCreditsAndDeductResult
      }
      reset_monthly_credits: {
        Args: { p_user_id: string; p_plan_id: PlanId }
        Returns: void
      }
      get_dashboard_stats: {
        Args: { p_user_id: string }
        Returns: GetDashboardStatsResult
      }
    }
    Enums: {
      plan_id: PlanId
      subscription_status: SubscriptionStatus
      credit_transaction_type: CreditTransactionType
      platform_id: PlatformId
      listing_status: ListingStatus
      poa_status: PoaStatus
      payment_type: PaymentType
      payment_status: PaymentStatus
    }
  }
}
