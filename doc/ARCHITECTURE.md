# SellerSaathi — Architecture & System Design

---

## 1. Tech Stack (Exact Versions)

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | v4 |
| UI Components | shadcn/ui | latest |
| Database | Supabase (PostgreSQL) | v2 JS client |
| Auth | Supabase Auth | v2 |
| Storage | Supabase Storage | v2 |
| AI | NVIDIA API (DeepSeek-v4-pro) | OpenAI-compat SDK |
| Payments | Razorpay | latest |
| State (client) | Zustand | v5 |
| Server state | TanStack Query | v5 |
| Validation | Zod | v3 |
| Email | Resend | latest |
| i18n | next-intl | v3 |
| PDF | @react-pdf/renderer | v3 |
| Deployment | Vercel | - |
| PWA | @ducanh2912/next-pwa | latest |

---

## 2. Project Directory Structure

```
sellersaathi/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── listings/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── poa/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── billing/page.tsx
│   │   └── settings/page.tsx
│   ├── (marketing)/
│   │   ├── page.tsx
│   │   ├── pricing/page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── ai/
│   │   │   ├── optimize-listing/route.ts
│   │   │   └── generate-poa/route.ts
│   │   └── payments/
│   │       ├── create-order/route.ts
│   │       ├── verify/route.ts
│   │       ├── buy-credits/route.ts
│   │       └── webhook/route.ts
│   ├── auth/callback/route.ts
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                ← shadcn primitives (auto-generated, do not edit)
│   ├── layout/            ← Navbar, Sidebar, Footer, ThemeToggle
│   ├── listings/          ← ListingForm, ListingResult, ListingCard
│   ├── poa/               ← POAForm, POAResult, POACard
│   ├── dashboard/         ← StatsCard, ActivityFeed, CreditMeter, QuickActions
│   ├── billing/           ← PlanCard, CreditPurchase, UpgradeModal
│   ├── landing/           ← Preloader, HeroSection, FeaturesSection, etc.
│   └── shared/            ← SEOScore, LanguageSelect, PlatformBadge, Logo
├── hooks/
│   ├── use-auth.ts
│   ├── use-credits.ts
│   ├── use-listing.ts
│   ├── use-poa.ts
│   └── use-subscription.ts
├── stores/
│   ├── auth.store.ts
│   └── ui.store.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts        ← browser client
│   │   ├── server.ts        ← server client (cookies)
│   │   └── admin.ts         ← service role client
│   ├── ai/
│   │   ├── client.ts        ← NVIDIA/DeepSeek init
│   │   ├── prompts/
│   │   │   ├── listing.prompts.ts
│   │   │   └── poa.prompts.ts
│   │   └── utils.ts
│   ├── payments/
│   │   └── razorpay.ts
│   └── utils/
│       ├── cn.ts            ← clsx + tailwind-merge
│       ├── format.ts        ← date, currency formatters
│       └── seo-score.ts     ← listing SEO scorer
├── types/
│   ├── database.types.ts    ← generated from Supabase schema
│   ├── listing.types.ts
│   ├── poa.types.ts
│   └── payment.types.ts
├── i18n/
│   ├── routing.ts
│   ├── request.ts
│   └── messages/
│       ├── en.json
│       ├── hi.json
│       ├── bn.json
│       ├── ta.json
│       ├── te.json
│       ├── kn.json
│       ├── mr.json
│       └── gu.json
├── supabase/
│   └── migrations/
│       ├── 001_extensions.sql
│       ├── 002_profiles.sql
│       ├── 003_plans.sql
│       ├── 004_subscriptions.sql
│       ├── 005_credit_transactions.sql
│       ├── 006_platforms.sql
│       ├── 007_categories.sql
│       ├── 008_listings.sql
│       ├── 009_poa_requests.sql
│       ├── 010_payments.sql
│       ├── 011_rls_policies.sql
│       ├── 012_functions_triggers.sql
│       └── 013_seed_data.sql
├── agents/
│   ├── AGENT_DB.md
│   ├── AGENT_BACKEND.md
│   ├── AGENT_AI.md
│   ├── AGENT_FRONTEND_COMPONENTS.md
│   ├── AGENT_FRONTEND_LIB.md
│   ├── AGENT_FRONTEND_PAGES.md
│   ├── AGENT_LANDING.md
│   └── AGENT_PAYMENTS.md
├── public/
│   ├── icons/               ← PWA icons (192px, 512px, favicon, apple-touch)
│   └── images/
│       └── landing/         ← hero-dashboard.png, og-image.png, etc.
├── MASTER_PRD.md
├── ARCHITECTURE.md
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
├── components.json          ← shadcn config
└── package.json
```

---

## 3. Agent Responsibilities Map

| Agent File | Owns | Reads |
|---|---|---|
| AGENT_DB | `supabase/migrations/*`, `types/database.types.ts` | ARCHITECTURE.md |
| AGENT_BACKEND | `app/api/**`, `middleware.ts`, `lib/supabase/*`, `app/auth/callback` | ARCHITECTURE.md |
| AGENT_AI | `lib/ai/**`, `app/api/ai/**` | ARCHITECTURE.md |
| AGENT_FRONTEND_COMPONENTS | `components/**` (excl. ui/) | ARCHITECTURE.md |
| AGENT_FRONTEND_LIB | `hooks/**`, `stores/**`, `lib/utils/**`, `types/**`, `i18n/**` | ARCHITECTURE.md |
| AGENT_FRONTEND_PAGES | `app/**/page.tsx`, `app/**/layout.tsx`, `app/globals.css` | ARCHITECTURE.md |
| AGENT_PAYMENTS | `lib/payments/**`, `app/api/payments/**` | ARCHITECTURE.md |

**Rule: Each agent reads ONLY their own agent file + this ARCHITECTURE.md. No agent reads another agent's file.**

---

## 4. Database Schema Overview

```
auth.users (Supabase managed)
    │
    └── profiles (1:1)
            │
            ├── subscriptions (1:many)
            ├── credit_transactions (1:many)
            ├── payments (1:many)
            ├── listings (1:many)
            │       └── platform (FK)
            │       └── category (FK)
            └── poa_requests (1:many)
                    └── platform (FK)

plans (reference table — 3 rows: free/pro/agency)
platforms (reference table — 2 rows: amazon_india/flipkart)
categories (reference table — seeded with Amazon+Flipkart categories)
```

---

## 5. Data Flow

### Listing Optimization
```
User fills form (client)
  → POST /api/ai/optimize-listing (server)
    → Validate auth + check credits (Supabase server client)
    → Deduct 1 credit (DB transaction)
    → Build prompt (lib/ai/prompts/listing.prompts.ts)
    → Stream response from NVIDIA DeepSeek API
    → Parse + save result to listings table
    → Stream response back to client (ReadableStream)
  → Client displays streaming output
  → On complete: show SEO score, copy/download options
```

### Payment Flow
```
User clicks upgrade (client)
  → POST /api/payments/create-order (server)
    → Create Razorpay subscription/order
    → Save pending payment record
    → Return order_id to client
  → Client opens Razorpay checkout modal
  → User pays
  → POST /api/payments/verify (server)
    → Verify Razorpay signature
    → Activate subscription in DB
    → Add credits to user
  → POST /api/payments/webhook (server)  [async]
    → Handle subscription renewals/cancellations
    → Update subscription status
```

---

## 6. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# NVIDIA / DeepSeek AI
NVIDIA_API_KEY=nvapi-...
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=deepseek-ai/deepseek-v4-pro

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_WEBHOOK_SECRET=

# Plans (Razorpay plan IDs — create in Razorpay dashboard)
RAZORPAY_PLAN_PRO=plan_xxx
RAZORPAY_PLAN_AGENCY=plan_xxx

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://sellersaathi.com
```

---

## 7. Key Conventions

### Component Pattern
- Server Components by default
- Add `'use client'` only when needed (event handlers, hooks, browser APIs)
- Colocate data fetching in Server Components, pass as props

### API Routes
- All API routes validate auth first via Supabase server client
- Return consistent shape: `{ data, error, message }`
- Use Zod for request body validation
- Streaming routes use `ReadableStream` with `TransformStream`

### Supabase Clients
- `lib/supabase/client.ts` → browser (singleton pattern)
- `lib/supabase/server.ts` → server components + API routes (cookies)
- `lib/supabase/admin.ts` → service role, ONLY in API routes/webhooks

### Error Handling
- All errors caught and logged
- User-facing errors in plain language
- Never expose stack traces to client

### Credit Validation
- Always validate credits server-side before AI call
- Use DB transactions to prevent race conditions on credit deduction

### Styling
- Tailwind v4 CSS variables for theming
- shadcn/ui components as base
- No inline styles
- Mobile-first responsive design

### i18n
- next-intl for all user-facing strings
- Never hardcode English strings in components
- AI output language is a separate param from UI language

---

## 8. Supabase Setup Checklist

Run migrations IN ORDER: 001 → 013

1. Create Supabase project
2. Run all SQL migrations in `supabase/migrations/` in order
3. Enable Google OAuth in Supabase Auth settings
4. Create storage bucket: `suspension-notices` (private)
5. Create storage bucket: `listing-pdfs` (private)
6. Set up Supabase Edge Functions (if needed for webhooks)
7. Copy Supabase URL + anon key + service role key to `.env.local`

---

## 9. Razorpay Setup Checklist

1. Create Razorpay account at razorpay.com
2. Create 2 subscription plans:
   - Pro: ₹999/month recurring
   - Agency: ₹2499/month recurring
3. Copy Plan IDs to `.env.local`
4. Set webhook URL: `https://sellersaathi.com/api/payments/webhook`
5. Webhook events to subscribe: `payment.captured`, `subscription.activated`, `subscription.cancelled`, `subscription.charged`

---

## 10. PWA Config

Add to `next.config.ts`:
```ts
import withPWA from '@ducanh2912/next-pwa'
```

PWA features:
- Installable (manifest.json)
- Offline fallback page
- Push notifications for credit alerts
- Cache: static assets + API responses (5 min)
