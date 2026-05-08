# AGENT_FRONTEND_LIB — Hooks, Stores, Utils, Types & i18n Agent

**Read:** This file + `ARCHITECTURE.md` only.

---

## Role

You own all React hooks, Zustand stores, utility functions, TypeScript types, and i18n message files. You are the shared foundation that AGENT_FRONTEND_COMPONENTS and AGENT_FRONTEND_PAGES depend on.

## Files You Own

```
hooks/use-auth.ts
hooks/use-credits.ts
hooks/use-listing.ts
hooks/use-poa.ts
hooks/use-subscription.ts
stores/auth.store.ts
stores/ui.store.ts
lib/utils/cn.ts
lib/utils/format.ts
lib/utils/seo-score.ts
types/database.types.ts         ← mirror of DB agent output
types/listing.types.ts
types/poa.types.ts
types/payment.types.ts
i18n/routing.ts
i18n/request.ts
i18n/messages/en.json
i18n/messages/hi.json
i18n/messages/bn.json
i18n/messages/ta.json
i18n/messages/te.json
i18n/messages/kn.json
i18n/messages/mr.json
i18n/messages/gu.json
```

## Do NOT Touch

- `components/`, `app/`
- `lib/supabase/`, `lib/ai/`, `lib/payments/`

---

## Utils

### `lib/utils/cn.ts`

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
```

### `lib/utils/format.ts`

```typescript
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date))
}
export function formatRelativeTime(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return formatDate(date)
}
```

### `lib/utils/seo-score.ts`

```typescript
interface ListingInput {
  title: string
  bullets: string[]
  description: string
  backend_keywords?: string
  platform: 'amazon_india' | 'flipkart'
}
export function calculateSEOScore(listing: ListingInput): number {
  let score = 0
  const titleLen = listing.title.length
  const optimalTitle = listing.platform === 'amazon_india' ? [150, 200] : [80, 100]
  if (titleLen >= optimalTitle[0] && titleLen <= optimalTitle[1]) score += 20
  else if (titleLen > 50) score += 10
  if (listing.bullets.length >= 5) score += 15
  const avgBulletLen = listing.bullets.reduce((a, b) => a + b.length, 0) / (listing.bullets.length || 1)
  if (avgBulletLen >= 200) score += 15
  else if (avgBulletLen >= 100) score += 8
  if (listing.description.length >= 500) score += 15
  else if (listing.description.length >= 200) score += 8
  if (listing.backend_keywords && listing.backend_keywords.length >= 100) score += 15
  const uniqueWords = new Set(listing.title.toLowerCase().split(' ')).size
  if (uniqueWords >= 10) score += 20
  else if (uniqueWords >= 6) score += 10
  return Math.min(100, score)
}
```

---

## Hooks

### `hooks/use-auth.ts`

```typescript
'use client'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth.store'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const { user, profile, setUser, setProfile, clearAuth } = useAuthStore()
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        if (data) setProfile(data)
      } else {
        clearAuth()
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  const signInWithEmail = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    return supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    clearAuth()
    router.push('/')
  }

  return { user, profile, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }
}
```

### `hooks/use-credits.ts`

```typescript
'use client'
import { useAuthStore } from '@/stores/auth.store'
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'

export function useCredits() {
  const { profile } = useAuthStore()
  const supabase = createClient()

  const { data: credits, refetch } = useQuery({
    queryKey: ['credits', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null
      const { data } = await supabase
        .from('profiles')
        .select('credits_remaining, plan')
        .eq('id', profile.id)
        .single()
      return data
    },
    enabled: !!profile?.id,
    staleTime: 30 * 1000,
  })

  const hasCredits = (required: number) => (credits?.credits_remaining ?? 0) >= required

  return {
    credits: credits?.credits_remaining ?? 0,
    plan: credits?.plan ?? 'free',
    hasCredits,
    refetchCredits: refetch
  }
}
```

### `hooks/use-listing.ts`

```typescript
'use client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ListingFormData } from '@/types/listing.types'

export function useListings() {
  const supabase = createClient()

  const { data: listings, isLoading } = useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      return data ?? []
    }
  })

  return { listings, isLoading }
}

export function useListing(id: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const { data } = await supabase.from('listings').select('*').eq('id', id).single()
      return data
    },
    enabled: !!id
  })
}

// Returns mutation + streaming handler
export function useOptimizeListing() {
  const mutation = useMutation({
    mutationFn: async (formData: ListingFormData) => {
      const response = await fetch('/api/ai/optimize-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error ?? 'Optimization failed')
      }
      return response  // Return response for streaming in component
    }
  })
  return mutation
}
```

### `hooks/use-poa.ts`

```typescript
'use client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { POAFormData } from '@/types/poa.types'

export function usePOAs() {
  const supabase = createClient()
  const { data: poas, isLoading } = useQuery({
    queryKey: ['poas'],
    queryFn: async () => {
      const { data } = await supabase.from('poa_requests').select('*').order('created_at', { ascending: false }).limit(50)
      return data ?? []
    }
  })
  return { poas, isLoading }
}

export function useGeneratePOA() {
  return useMutation({
    mutationFn: async (formData: POAFormData) => {
      const response = await fetch('/api/ai/generate-poa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error ?? 'POA generation failed')
      }
      return response
    }
  })
}
```

### `hooks/use-subscription.ts`

```typescript
'use client'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth.store'

export function useSubscription() {
  const { profile } = useAuthStore()
  const supabase = createClient()

  return useQuery({
    queryKey: ['subscription', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .single()
      return data
    },
    enabled: !!profile?.id
  })
}
```

---

## Stores

### `stores/auth.store.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthState {
  user: User | null
  profile: Profile | null
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      clearAuth: () => set({ user: null, profile: null }),
    }),
    { name: 'sellersaathi-auth', partialize: (state) => ({ profile: state.profile }) }
  )
)
```

### `stores/ui.store.ts`

```typescript
import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  upgradeModalOpen: boolean
  selectedLanguage: string
  setSidebarOpen: (open: boolean) => void
  setUpgradeModalOpen: (open: boolean) => void
  setLanguage: (lang: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  upgradeModalOpen: false,
  selectedLanguage: 'en',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setUpgradeModalOpen: (open) => set({ upgradeModalOpen: open }),
  setLanguage: (lang) => set({ selectedLanguage: lang }),
}))
```

---

## Types

### `types/listing.types.ts`

```typescript
export interface ListingFormData {
  platform: 'amazon_india' | 'flipkart'
  category_id: string
  input_title: string
  input_description: string
  input_bullets: string[]
  input_specs: Record<string, string>
  input_keywords?: string
  output_language: string
}

export interface ListingResult {
  optimized_title: string
  optimized_bullets: string[]
  optimized_description: string
  backend_keywords?: string
  flipkart_highlights?: string[]
  flipkart_tags?: string
  seo_score: number
  improvements: string[]
}
```

### `types/poa.types.ts`

```typescript
export interface POAFormData {
  platform: 'amazon_india' | 'flipkart'
  asin_or_listing_id: string
  suspension_reason: string
  suspension_notice_text: string
}

export interface POAResult {
  root_cause: string
  corrective_actions: string
  preventive_actions: string
  summary: string
  subject_line: string
}
```

### `types/payment.types.ts`

```typescript
export type PlanId = 'free' | 'pro' | 'agency'
export interface CreditPack { credits: number; price_inr: number }
```

---

## i18n Setup

### `i18n/routing.ts`

```typescript
import { defineRouting } from 'next-intl/routing'
export const routing = defineRouting({
  locales: ['en', 'hi', 'bn', 'ta', 'te', 'kn', 'mr', 'gu'],
  defaultLocale: 'en'
})
```

### `i18n/request.ts`

```typescript
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as any)) locale = routing.defaultLocale
  return { locale, messages: (await import(`./messages/${locale}.json`)).default }
})
```

### `i18n/messages/en.json` (key structure — all other languages mirror this)

```json
{
  "nav": {
    "dashboard": "Dashboard",
    "listings": "Listings",
    "poa": "POA Generator",
    "billing": "Billing",
    "settings": "Settings",
    "logout": "Logout"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome back, {name}",
    "credits": "{count} credits remaining",
    "quickActions": "Quick Actions",
    "newListing": "New Listing",
    "newPOA": "New POA",
    "recentActivity": "Recent Activity"
  },
  "listing": {
    "title": "Listing Optimizer",
    "new": "New Listing",
    "platform": "Platform",
    "category": "Category",
    "productTitle": "Product Title",
    "description": "Description",
    "bullets": "Bullet Points",
    "specs": "Specifications",
    "keywords": "Target Keywords",
    "outputLanguage": "Output Language",
    "optimize": "Optimize Listing",
    "optimizing": "Optimizing...",
    "seoScore": "SEO Score",
    "before": "Before",
    "after": "After",
    "copyAll": "Copy All",
    "downloadPDF": "Download PDF"
  },
  "poa": {
    "title": "POA Generator",
    "new": "New POA Request",
    "platform": "Platform",
    "asin": "ASIN / Listing ID",
    "reason": "Suspension Reason",
    "notice": "Suspension Notice",
    "generate": "Generate POA",
    "generating": "Generating...",
    "rootCause": "Root Cause",
    "corrective": "Corrective Actions",
    "preventive": "Preventive Actions",
    "download": "Download POA"
  },
  "billing": {
    "title": "Billing & Credits",
    "currentPlan": "Current Plan",
    "upgrade": "Upgrade",
    "buyCredits": "Buy Credits",
    "credits": "Credits",
    "pricePerCredit": "₹49 per credit"
  },
  "plans": { "free": "Free", "pro": "Pro", "agency": "Agency" },
  "errors": {
    "insufficientCredits": "Not enough credits. Buy more or upgrade your plan.",
    "unauthorized": "Please login to continue.",
    "generic": "Something went wrong. Please try again."
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "copy": "Copy",
    "copied": "Copied!",
    "download": "Download",
    "back": "Back",
    "loading": "Loading..."
  }
}
```

---

## Packages Required

```json
"@tanstack/react-query": "^5",
"zustand": "^5",
"next-intl": "^3",
"clsx": "^2",
"tailwind-merge": "^2"
```
