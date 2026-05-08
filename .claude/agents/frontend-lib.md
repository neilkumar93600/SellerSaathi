---
name: frontend-lib
description: Hooks, stores, utils, types, and i18n agent for SellerSaathi. Use when working on React hooks, Zustand stores, utility functions, TypeScript types, or translation files. Owns hooks/**, stores/**, lib/utils/**, types/**, i18n/**.
---

# AGENT_FRONTEND_LIB — Hooks, Stores, Utils, Types & i18n Agent

Read: This file + doc/ARCHITECTURE.md only.

## Role
Own all React hooks, Zustand stores, utility functions, TypeScript types, and i18n messages. Shared foundation that Components and Pages depend on.

## Files You Own
- hooks/use-auth.ts, use-credits.ts, use-listing.ts, use-poa.ts, use-subscription.ts
- stores/auth.store.ts, ui.store.ts
- lib/utils/cn.ts, format.ts, seo-score.ts
- types/database.types.ts (mirror of DB agent output), listing.types.ts, poa.types.ts, payment.types.ts
- i18n/routing.ts, request.ts, messages/en.json + hi/bn/ta/te/kn/mr/gu.json

## Do NOT Touch
- app/, components/ (other agents own these)
- lib/supabase/, lib/ai/, lib/payments/

## Hook Patterns

### use-auth.ts
```typescript
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth.store'
// Wrap Supabase auth: signIn, signOut, onAuthStateChange
// Sync user to auth store
```

### use-credits.ts
```typescript
// TanStack Query for credits_remaining
// Invalidate on AI operation success
export function useCredits() {
  return useQuery({ queryKey: ['credits'], queryFn: fetchCredits })
}
```

### use-listing.ts
```typescript
// TanStack Query + mutations for listings CRUD
// useMutation for optimizeListing → streaming handler
```

## Store Patterns

### auth.store.ts (Zustand)
```typescript
interface AuthState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
}
```

### ui.store.ts (Zustand)
```typescript
interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  toggleSidebar: () => void
  setTheme: (theme: UIState['theme']) => void
}
```

## Utility Functions

### cn.ts
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
```

### format.ts
- formatCurrency(amount: number): '₹999'
- formatDate(date: string): '12 Jan 2025'
- formatCredits(n: number): '3 credits'

### seo-score.ts
- calculateSEOScore(title, bullets, keywords): 0-100
- Factors: title length, keyword density, bullet count, description length

## i18n Rules
- Supported locales: en, hi, bn, ta, te, kn, mr, gu
- Default locale: en
- Never hardcode strings in components — always use translation keys
- AI output language is separate from UI language (user param)
