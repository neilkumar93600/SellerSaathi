# AGENT_FRONTEND_COMPONENTS — UI Components Agent

**Read:** This file + `ARCHITECTURE.md` only.

---

## Role

You build all reusable React components. You do NOT create pages or hooks — you receive data as props and emit events via callbacks.

## Files You Own

```
components/layout/Navbar.tsx
components/layout/Sidebar.tsx
components/layout/Footer.tsx
components/layout/DashboardLayout.tsx
components/listings/ListingForm.tsx
components/listings/ListingResult.tsx
components/listings/ListingCard.tsx
components/poa/POAForm.tsx
components/poa/POAResult.tsx
components/poa/POACard.tsx
components/dashboard/StatsCard.tsx
components/dashboard/ActivityFeed.tsx
components/dashboard/CreditMeter.tsx
components/dashboard/QuickActions.tsx
components/billing/PlanCard.tsx
components/billing/CreditPurchase.tsx
components/billing/UpgradeModal.tsx
components/shared/SEOScore.tsx
components/shared/LanguageSelect.tsx
components/shared/PlatformBadge.tsx
components/shared/LoadingStream.tsx
components/shared/EmptyState.tsx
components/shared/CreditBadge.tsx
```

## Do NOT Touch

- `app/`, `hooks/`, `stores/`, `lib/`
- `components/ui/` (shadcn auto-generated)

---

## Design System

**Brand Colors:**

- Primary: `#FF6B35` (orange — energy, India)
- Secondary: `#1A1A2E` (dark navy)
- Success: `#22C55E`
- Warning: `#F59E0B`
- Accent: `#7C3AED` (purple for premium)

**Typography:**

- Font: Inter (Google Fonts)
- Dashboard heading: `text-2xl font-semibold`
- Card title: `text-base font-medium`
- Body: `text-sm`
- Muted: `text-sm text-muted-foreground`

**Spacing:** Use Tailwind classes only. No arbitrary values unless necessary.

**All components:** `'use client'` directive unless purely presentational with no state/events.

---

## shadcn/ui Components to Use

Import from `@/components/ui/`:

- `Button`, `Input`, `Textarea`, `Select`, `Label`
- `Card`, `CardHeader`, `CardContent`, `CardFooter`
- `Badge`, `Separator`, `Progress`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`
- `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`
- `Tooltip`, `TooltipContent`, `TooltipTrigger`
- `DropdownMenu` variants
- `Avatar`, `AvatarImage`, `AvatarFallback`
- `ScrollArea`
- `Skeleton`
- `Toast` (via `useToast` hook from shadcn)

---

## Component Specifications

### `Navbar.tsx`

```
Props: { user?: User, profile?: Profile, onSignOut: () => void }
- Logo: "SellerSaathi" with saffron S icon
- Right side: CreditBadge + Avatar dropdown (settings, billing, logout)
- Mobile: hamburger menu
- Language selector (LanguageSelect component)
```

### `Sidebar.tsx`

```
Props: { isOpen: boolean, onToggle: () => void }
- Links: Dashboard, Listings, POA Generator, Billing, Settings
- Icons: Tabler icons (ti-home, ti-list, ti-file-text, ti-credit-card, ti-settings)
- Active state: bg-primary/10 text-primary border-r-2 border-primary
- Collapsed state: icons only
```

### `ListingForm.tsx`

```
Props: {
  onSubmit: (data: ListingFormData) => void
  isLoading: boolean
  creditsRequired: number  // 1
}
Sections:
1. Platform selector (Amazon India / Flipkart toggle)
2. Category dropdown (filtered by platform)
3. Product title input
4. Description textarea
5. Bullet points (5 inputs with +/- controls)
6. Specs key-value pairs (add/remove rows)
7. Target keywords (optional)
8. Output language selector (LanguageSelect)
9. Submit button with credit cost shown: "Optimize (1 credit)"

Use react-hook-form + zod validation.
```

### `ListingResult.tsx`

```
Props: {
  listing: Listing
  isStreaming: boolean
  streamContent?: string
}
Layout: 2 columns on desktop (before / after)
- SEO score comparison (SEOScore component)
- Tabs: Title | Bullets | Description | Keywords
- Each section: original (muted) vs optimized (highlighted)
- Copy button per section
- "Download PDF" button
- "Improvements" accordion showing AI explanations
Show streaming animation while isStreaming=true
```

### `ListingCard.tsx`

```
Props: { listing: Listing, onClick: () => void }
- Platform badge
- Title (truncated)
- SEO score chip (before → after with arrow)
- Created date
- Status badge (pending|processing|completed|failed)
```

### `POAForm.tsx`

```
Props: { onSubmit: (data: POAFormData) => void, isLoading: boolean }
Sections:
1. Platform selector
2. ASIN / Listing ID input
3. Suspension reason (textarea)
4. Suspension notice text (large textarea with paste prompt)
5. Submit: "Generate POA (2 credits)"
```

### `POAResult.tsx`

```
Props: { poa: POARequest, isStreaming: boolean }
Sections (accordion or tabs):
1. Subject Line (email subject — copy button)
2. Summary paragraph
3. Root Cause Analysis
4. Corrective Actions
5. Preventive Actions
"Copy Full POA" button + "Download PDF" button
```

### `StatsCard.tsx`

```
Props: { title: string, value: string | number, icon: string, trend?: string, description?: string }
- Tabler icon in colored circle
- Large number value
- Trend indicator (green/red)
```

### `CreditMeter.tsx`

```
Props: { used: number, total: number, plan: string }
- Progress bar (orange fill)
- "X of Y credits used" text
- "Buy more" link if > 80% used
- "Upgrade" link if on free plan
```

### `ActivityFeed.tsx`

```
Props: { activities: Array<{ type: 'listing'|'poa', title: string, date: string, status: string }> }
- Timeline style list
- Icon per type
- Relative timestamp
- Status badge
```

### `PlanCard.tsx`

```
Props: { plan: Plan, isCurrentPlan: boolean, onUpgrade: (planId: string) => void }
- Plan name + price
- Feature list with checkmarks
- CTA button
- "Most Popular" badge on Pro
- Current plan shimmer border
```

### `CreditPurchase.tsx`

```
Props: { onPurchase: (credits: number, priceInr: number) => void, isLoading: boolean }
- 3 credit packs: 5/10/25 credits
- Price per pack shown
- "Best Value" badge on 25 credits
```

### `UpgradeModal.tsx`

```
Props: { isOpen: boolean, onClose: () => void, reason?: string }
- Trigger: insufficient credits
- Shows Pro vs Agency plan cards
- Razorpay checkout trigger on "Upgrade"
- Loads Razorpay script dynamically
```

### `SEOScore.tsx`

```
Props: { score: number, label?: string }
- Circular progress indicator
- Color: red 0-40, amber 41-70, green 71-100
- Score number in center
```

### `LanguageSelect.tsx`

```
Props: { value: string, onChange: (lang: string) => void }
Options: en/hi/bn/ta/te/kn/mr/gu with flag emojis + native name
- 🇬🇧 English | 🇮🇳 हिन्दी | 🇮🇳 বাংলা | 🇮🇳 தமிழ் | 🇮🇳 తెలుగు | 🇮🇳 ಕನ್ನಡ | 🇮🇳 मराठी | 🇮🇳 ગુજરાતી
```

### `PlatformBadge.tsx`

```
Props: { platform: 'amazon_india' | 'flipkart' }
Amazon: orange badge "Amazon India"
Flipkart: blue badge "Flipkart"
```

### `LoadingStream.tsx`

```
Props: { message?: string }
- Animated dots "AI is optimizing your listing..."
- Skeleton lines that pulse
```

### `CreditBadge.tsx`

```
Props: { credits: number }
- Shows: "⚡ {credits}" in navbar
- Orange if > 5, amber if 2-5, red if 0-1
- Click → goes to /dashboard/billing
```

### `EmptyState.tsx`

```
Props: { title: string, description: string, action?: { label: string, href: string } }
- Centered illustration placeholder
- Title + description
- Optional CTA button
```

---

## Packages Required

```json
"react-hook-form": "^7",
"@hookform/resolvers": "^3",
"zod": "^3",
"@tabler/icons-react": "^3",
"@react-pdf/renderer": "^3"
```

## Key Import Patterns

```typescript
import { cn } from '@/lib/utils/cn'
import { formatINR, formatDate, formatRelativeTime } from '@/lib/utils/format'
import type { ListingFormData } from '@/types/listing.types'
import type { POAFormData } from '@/types/poa.types'
```
