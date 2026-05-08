# AGENT_FRONTEND_PAGES — Pages & Layouts Agent (v2)

**Read:** This file + `ARCHITECTURE.md` only.

---

## Role

Assemble pages using components. Own all Next.js page.tsx, layout.tsx files, globals.css, next.config.ts, and package.json. Define the full CSS design system (variables for both themes).

## Files You Own

```
app/globals.css
app/layout.tsx
app/providers.tsx
app/(marketing)/layout.tsx
app/(marketing)/pricing/page.tsx
app/(auth)/layout.tsx
app/(auth)/login/page.tsx
app/(auth)/signup/page.tsx
app/(dashboard)/layout.tsx
app/(dashboard)/dashboard/page.tsx
app/(dashboard)/listings/page.tsx
app/(dashboard)/listings/new/page.tsx
app/(dashboard)/listings/[id]/page.tsx
app/(dashboard)/poa/page.tsx
app/(dashboard)/poa/new/page.tsx
app/(dashboard)/poa/[id]/page.tsx
app/(dashboard)/billing/page.tsx
app/(dashboard)/settings/page.tsx
next.config.ts
tailwind.config.ts
components.json
package.json
public/manifest.json
```

**NOTE:** `app/(marketing)/page.tsx` is owned by AGENT_LANDING — do NOT create it.

## Do NOT Touch

- `components/` (Components agent)
- `lib/`, `hooks/`, `stores/` (Lib agent)
- `app/api/` (Backend agent)
- `app/(marketing)/page.tsx` (Landing agent)

---

## globals.css — Full Design System

```css
@import "tailwindcss";
@import url("https://fonts.googleapis.com/css2?family=Play:wght@400;700&family=Poppins:wght@300;400;500;600;700&display=swap");

:root {
  /* Brand */
  --color-primary: #059669;
  --color-primary-dark: #047857;
  --color-primary-light: #10b981;
  --color-primary-xlight: #d1fae5;
  --color-accent: #6366f1;
  --color-accent-light: #e0e7ff;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-success: #10b981;

  /* Glass surfaces */
  --color-bg-base: #f0fdf4;
  --color-bg-card: rgba(255, 255, 255, 0.6);
  --color-bg-card-hover: rgba(255, 255, 255, 0.8);
  --color-border-glass: rgba(255, 255, 255, 0.7);
  --color-border-subtle: rgba(5, 150, 105, 0.15);
  --color-shadow-glass: 0 4px 24px rgba(5, 150, 105, 0.1);
  --color-shadow-hover: 0 8px 32px rgba(5, 150, 105, 0.18);

  /* Text */
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;

  /* Fonts */
  --font-display: "Play", sans-serif;
  --font-body: "Poppins", sans-serif;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
}

.dark {
  --color-primary: #10b981;
  --color-primary-dark: #059669;
  --color-primary-light: #34d399;
  --color-primary-xlight: #064e3b;
  --color-accent: #818cf8;
  --color-accent-light: #1e1b4b;

  --color-bg-base: #030f09;
  --color-bg-card: rgba(255, 255, 255, 0.04);
  --color-bg-card-hover: rgba(255, 255, 255, 0.07);
  --color-border-glass: rgba(255, 255, 255, 0.09);
  --color-border-subtle: rgba(16, 185, 129, 0.18);
  --color-shadow-glass: 0 4px 24px rgba(0, 0, 0, 0.4);
  --color-shadow-hover: 0 8px 32px rgba(16, 185, 129, 0.12);

  --color-text-primary: #f9fafb;
  --color-text-secondary: #9ca3af;
  --color-text-muted: #6b7280;
}

* {
  box-sizing: border-box;
}

body {
  font-family: var(--font-body);
  background-color: var(--color-bg-base);
  color: var(--color-text-primary);
  transition:
    background-color 0.3s,
    color 0.3s;
}

h1,
h2,
h3 {
  font-family: var(--font-display);
}

/* Streaming cursor */
.stream-cursor::after {
  content: "▋";
  animation: blink 1s step-end infinite;
  color: var(--color-primary);
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}

/* Shimmer skeleton */
.shimmer {
  background: linear-gradient(
    90deg,
    rgba(5, 150, 105, 0.05) 25%,
    rgba(5, 150, 105, 0.1) 50%,
    rgba(5, 150, 105, 0.05) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Glassmorphism utility */
.glass {
  background: var(--color-bg-card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--color-border-glass);
  box-shadow: var(--color-shadow-glass);
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--color-primary-xlight);
  border-radius: 3px;
}
.dark ::-webkit-scrollbar-thumb {
  background: var(--color-primary-xlight);
}
```

---

## Root Layout (`app/layout.tsx`)

```tsx
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'SellerSaathi — AI Tools for Amazon India & Flipkart Sellers', template: '%s | SellerSaathi' },
  description: 'AI-powered listing optimizer and POA generator for Amazon India and Flipkart sellers. Replace ₹10,000/month agencies.',
  keywords: ['amazon india listing optimizer', 'flipkart seller tools', 'seller saathi', 'amazon seo india', 'flipkart listing seo'],
  openGraph: { type: 'website', locale: 'en_IN', siteName: 'SellerSaathi', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
  manifest: '/manifest.json',
  icons: { icon: '/icons/favicon.ico', apple: '/icons/apple-touch-icon.png' },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <NextIntlClientProvider messages={messages}>
            <Providers>{children}</Providers>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## Providers (`app/providers.tsx`)

```tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60000 } } }))
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}
```

---

## Dashboard Layout (`/dashboard/layout.tsx`)

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg-base)' }}>
      {/* Orbs behind everything */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-1/4 h-96 w-96 rounded-full blur-3xl" style={{ background: 'rgba(5,150,105,0.07)' }} />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full blur-3xl" style={{ background: 'rgba(99,102,241,0.05)' }} />
      </div>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar user={user} profile={profile} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
```

---

## Dashboard Home (`/dashboard/page.tsx`)

```tsx
// Server component
// Fetch: supabase.rpc('get_dashboard_stats', { p_user_id: user.id })
// Fetch: recent listings (5) + recent poas (5)

// Layout: bento grid
// Row 1: 4 StatsCards (Credits / Listings / POAs / Plan)
// Row 2: CreditMeter (1/3 width) + QuickActions (2/3 width)
// Row 3: ActivityFeed (merged listings+poas sorted by date)
```

## Listings Page (`/dashboard/listings/page.tsx`)

```tsx
// Server component — fetch all listings paginated (20 per page)
// Header: "My Listings" + "New Listing" button
// Grid: ListingCard components (3 col desktop, 2 tablet, 1 mobile)
// Empty: EmptyState with ti-list icon
```

## New Listing (`/dashboard/listings/new/page.tsx`)

```tsx
'use client'
// Fetch categories client-side from Supabase (filtered by platform toggle)
// Render ListingForm
// On submit → fetch('/api/ai/optimize-listing') → ReadableStream
// Stream reader: parse SSE, accumulate content, show in LoadingStream → ListingResult
// On complete: router.push('/dashboard/listings/' + listingId)
// On error 'insufficient_credits': open UpgradeModal
```

## Listing Result (`/dashboard/listings/[id]/page.tsx`)

```tsx
// Server component — fetch listing by id (auth check via RLS)
// If not found: notFound()
// If status=processing: client component wrapper that polls every 3s
// Render ListingResult component
```

## POA Pages — same pattern as Listing pages

```
/dashboard/poa/page.tsx        → grid of POACard components
/dashboard/poa/new/page.tsx    → POAForm → stream → redirect to result
/dashboard/poa/[id]/page.tsx   → POAResult component
```

## Billing (`/dashboard/billing/page.tsx`)

```tsx
// Server component
// Fetch: subscription + payment history (last 10)
// Sections:
//   1. Current plan banner (glass card, plan name + renew date)
//   2. CreditMeter + "Buy more credits" button
//   3. PlanCard grid (show only plans above current plan)
//   4. Payment history table
```

## Settings (`/dashboard/settings/page.tsx`)

```tsx
'use client'
// Sections:
//   Profile: name input + avatar upload (Supabase Storage)
//   Preferences: language select + primary platform toggle
//   Security: change password (email users only, hidden for Google users)
//   Danger zone: delete account button (confirmation dialog)
```

## Auth Pages

### `/login/page.tsx`

```tsx
'use client'
// Full-screen centered layout with bg orbs (same as dashboard)
// Glass card 400px max-w
// Logo centered top
// "Continue with Google" → supabase.auth.signInWithOAuth Google
// Divider "or"
// Email + password form (react-hook-form)
// "Forgot password?" link
// "New to SellerSaathi? Sign up" link
// Framer Motion: card scaleIn on mount
```

### `/signup/page.tsx`

```tsx
'use client'
// Same layout as login
// Name input + Google OAuth button + email/password form
// Terms checkbox (required)
// After signup: send welcome email via /api/auth/welcome (Resend)
```

## Pricing Page (`/pricing/page.tsx`)

```tsx
// Server component — fetch plans from Supabase
// Layout: 3 PlanCard components in grid
// Toggle: Monthly (only option in v1 — annual in v2)
// Below plans: CreditPurchase component
// FAQ accordion (hardcoded)
// CTA: "Start free today" → /signup
```

---

## next.config.ts

```ts
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import withPWA from '@ducanh2912/next-pwa'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const base: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
}

export default withNextIntl(
  withPWA({ dest: 'public', disable: process.env.NODE_ENV === 'development' })(base)
)
```

## tailwind.config.ts

```ts
import type { Config } from 'tailwindcss'
export default {
  darkMode: 'class',
  content: ['./**/*.{ts,tsx}', '!./node_modules'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Play', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: { DEFAULT: '#059669', dark: '#047857', light: '#10b981' },
        accent:  { DEFAULT: '#6366f1', light: '#e0e7ff' },
      },
      borderRadius: { '2xl': '16px', '3xl': '24px' },
      backdropBlur: { xs: '4px' },
    },
  },
  plugins: [],
} satisfies Config
```

## public/manifest.json

```json
{
  "name": "SellerSaathi",
  "short_name": "SellerSaathi",
  "description": "AI tools for Amazon India & Flipkart sellers",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#f0fdf4",
  "theme_color": "#059669",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

## package.json (key dependencies)

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5",
    "@supabase/supabase-js": "^2",
    "@supabase/ssr": "latest",
    "openai": "^4",
    "razorpay": "^2",
    "next-intl": "^3",
    "next-themes": "^0.4",
    "zustand": "^5",
    "@tanstack/react-query": "^5",
    "framer-motion": "^11",
    "zod": "^3",
    "react-hook-form": "^7",
    "@hookform/resolvers": "^3",
    "clsx": "^2",
    "tailwind-merge": "^2",
    "@tabler/icons-react": "^3",
    "@react-pdf/renderer": "^3",
    "resend": "latest",
    "@ducanh2912/next-pwa": "latest",
    "gsap": "^3"
  },
  "devDependencies": {
    "tailwindcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "eslint": "^9",
    "eslint-config-next": "^15"
  }
}
```
