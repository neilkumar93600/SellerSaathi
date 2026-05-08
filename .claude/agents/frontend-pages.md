---
name: frontend-pages
description: Pages and layouts agent for SellerSaathi. Use when working on Next.js page.tsx/layout.tsx files, globals.css, next.config.ts, or the CSS design system. Assembles pages using components.
---

# AGENT_FRONTEND_PAGES — Pages & Layouts Agent

Read: This file + doc/ARCHITECTURE.md only.

## Role
Assemble pages using components. Own all Next.js page.tsx, layout.tsx files, globals.css, next.config.ts, package.json. Define the full CSS design system.

## Files You Own
- app/globals.css
- app/layout.tsx, app/providers.tsx
- app/(marketing)/layout.tsx, pricing/page.tsx
- app/(auth)/layout.tsx, login/page.tsx, signup/page.tsx
- app/(dashboard)/layout.tsx, dashboard/page.tsx
- app/(dashboard)/listings/page.tsx, new/page.tsx, [id]/page.tsx
- app/(dashboard)/poa/page.tsx, new/page.tsx, [id]/page.tsx
- app/(dashboard)/billing/page.tsx, settings/page.tsx
- next.config.ts, package.json, tailwind.config.ts, components.json

## Do NOT Touch
- components/ (Components agent)
- hooks/, stores/, lib/ (Lib/Backend/AI/Payments agents)

## Page Rules
- Server Components by default
- Fetch data in Server Components, pass as props to client components
- Use Next.js 15 App Router patterns (async page props, layouts)
- All pages wrapped in appropriate layout (auth/dashboard/marketing)
- Redirect unauthenticated users at page level (redundant with middleware — defense in depth)

## Route Groups
- (auth): /login, /signup — public, no sidebar
- (dashboard): /dashboard, /listings/*, /poa/*, /billing, /settings — requires auth + sidebar
- (marketing): /, /pricing — public, landing navbar

## CSS Design System (globals.css)
Define CSS variables for both light and dark themes:
- --background, --foreground
- --primary (brand orange for marketplace feel)
- --secondary
- --muted, --muted-foreground
- --card, --card-foreground
- --border, --input, --ring
- --destructive

## next.config.ts
Must include:
- withPWA wrapper (@ducanh2912/next-pwa)
- images: remotePatterns for Supabase storage
- i18n handled by next-intl middleware (not next.config)
