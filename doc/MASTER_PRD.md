# SellerSaathi — Master Product Requirements Document

**Version:** 1.0  
**Status:** Active  
**Stack:** Next.js 15 · TypeScript · Tailwind v4 · shadcn/ui · Supabase · NVIDIA DeepSeek · Razorpay  

---

## 1. Product Vision

SellerSaathi is an AI-powered web platform that replaces ₹5,000–15,000/month agencies for Amazon India and Flipkart sellers. It gives SMB sellers and D2C brands the same quality listing optimization, suspension recovery, and analytics that only large sellers could previously afford — at ₹999/month.

**Tagline:** *Aapka digital seller dost* (Your digital seller companion)

---

## 2. Target Users

| Segment | Description | Pain |
|---|---|---|
| Small Sellers | 0–50 SKUs, self-managed | No time/skills for SEO, fear of suspension |
| D2C Brands | Own-brand products on Amazon/Flipkart | Listings don't rank, ad spend wasted |
| Resellers | 50–500 SKUs, price-competitive | Bulk listing updates take days |
| Seller Agencies | Manage 5–20 seller accounts | Need faster tools, not manual effort |

---

## 3. V1 Feature Set

### 3.1 Listing Optimizer
- User inputs: product title, description, bullet points, category, key features, target keywords (optional)
- Platforms: Amazon India, Flipkart (separate optimized output per platform)
- AI generates: optimized title, 5 bullet points, full description, backend search terms
- SEO score (0–100) displayed before/after
- Language toggle: English, Hindi, Bengali, Tamil, Telugu, Kannada, Marathi, Gujarati
- Output: copy-paste ready + downloadable PDF

### 3.2 POA Generator (Plan of Action)
- User inputs: suspension notice text (paste or upload), ASIN/Listing ID, platform, category
- AI generates: Root Cause Analysis, Corrective Actions, Preventive Actions — Amazon/Flipkart format compliant
- Tone: professional, factual, no admissions of guilt
- Language: English only (Amazon/Flipkart require English for POA)
- One-click PDF export

### 3.3 Basic Dashboard
- Credits used today / this month
- Total listings optimized (count)
- Total POAs generated (count)
- Recent activity feed (last 10 actions)
- Subscription status + upgrade CTA
- Quick links to new listing / new POA

---

## 4. Monetization

### 4.1 Plans

| Plan | Price | Credits | Features |
|---|---|---|---|
| Free | ₹0 | 3 credits lifetime | Listing optimizer only, English only, watermarked PDF |
| Growth | ₹499/mo | 10 credits/mo | Listing optimizer, all languages, clean PDF, SEO score |
| Pro | ₹1,499/mo | 50 credits/mo | All Growth + POA generator, priority support |
| Agency | ₹4,999/mo | 200 credits/mo | All Pro + bulk upload (CSV), API access, 5 team seats |

### 4.2 Credit System
- 1 listing optimization = 1 credit
- 1 POA generation = 2 credits
- Credits reset monthly on paid plans (Growth/Pro/Agency)
- Credits never expire on Free plan
- Extra credits: ₹49/credit (one-time Razorpay purchase)

### 4.3 Freemium Logic
- New user gets 3 free credits on signup
- After 3 credits: soft paywall (upgrade modal, not hard block)
- Dashboard always accessible, actions require credits

---

## 5. Platform Logic

### 5.1 Amazon India
- Title limit: 200 characters
- Bullet points: 5 bullets, 500 chars each
- Description: 2000 characters
- Backend keywords: 250 bytes
- Category-specific rules applied per prompt

### 5.2 Flipkart
- Title limit: 100 characters
- Highlights: 5 points, 100 chars each
- Description: 5000 characters
- Tags: comma-separated keywords
- Seller part number required

---

## 6. Languages (V1)

| Code | Language | UI | AI Output |
|---|---|---|---|
| en | English | ✅ | ✅ Default |
| hi | Hindi | ✅ | ✅ |
| bn | Bengali | ✅ | ✅ |
| ta | Tamil | ✅ | ✅ |
| te | Telugu | ✅ | ✅ |
| kn | Kannada | ✅ | ✅ |
| mr | Marathi | ✅ | ✅ |
| gu | Gujarati | ✅ | ✅ |

Language preference stored in user profile. AI output language controlled per request independently of UI language.

---

## 7. Auth Flows

- Google OAuth (primary — most Indian sellers use Gmail)
- Email + password (secondary)
- Email verification required for email signup
- Supabase handles sessions + JWT
- Protected routes: all `/dashboard/**` routes
- Public routes: `/`, `/pricing`, `/login`, `/signup`

---

## 8. User Flows

### 8.1 New User Onboarding
1. Land on `/` → click "Start Free"
2. Auth via Google or Email
3. Profile completion modal (name, primary platform, category)
4. Dashboard → 3 credits shown → "Optimize your first listing"

### 8.2 Listing Optimizer Flow
1. Dashboard → "New Listing" button
2. Select platform (Amazon / Flipkart)
3. Select category (dropdown, platform-specific)
4. Fill form: title, description, bullets, specs
5. Select output language
6. Click "Optimize" → deducts 1 credit → AI processing (streaming)
7. Results page: before/after, SEO score, copy buttons
8. Download PDF or save to history

### 8.3 POA Generator Flow
1. Dashboard → "New POA" button
2. Select platform
3. Paste suspension notice or upload image/PDF
4. Enter ASIN/Listing ID
5. Click "Generate POA" → deducts 2 credits → AI processing
6. Results: formatted POA document
7. Download PDF

### 8.4 Upgrade Flow
1. Credit exhausted → upgrade modal appears
2. Click "Upgrade to Pro" → `/pricing`
3. Razorpay subscription checkout
4. Webhook confirms → credits added → dashboard updated

---

## 9. Pages

| Route | Description | Auth |
|---|---|---|
| `/` | Landing page | Public |
| `/pricing` | Pricing page | Public |
| `/login` | Login page | Public |
| `/signup` | Signup page | Public |
| `/auth/callback` | OAuth callback | Public |
| `/dashboard` | Main dashboard | Protected |
| `/dashboard/listings` | All listings history | Protected |
| `/dashboard/listings/new` | New listing form | Protected |
| `/dashboard/listings/[id]` | Listing result detail | Protected |
| `/dashboard/poa` | All POA history | Protected |
| `/dashboard/poa/new` | New POA form | Protected |
| `/dashboard/poa/[id]` | POA result detail | Protected |
| `/dashboard/settings` | Profile + billing | Protected |
| `/dashboard/billing` | Credits + subscription | Protected |

---

## 10. API Routes

| Route | Method | Description |
|---|---|---|
| `/api/ai/optimize-listing` | POST | Run listing optimization |
| `/api/ai/generate-poa` | POST | Run POA generation |
| `/api/payments/create-order` | POST | Create Razorpay order/subscription |
| `/api/payments/verify` | POST | Verify payment signature |
| `/api/payments/webhook` | POST | Razorpay webhook handler |
| `/api/payments/buy-credits` | POST | One-time credit purchase |

---

## 11. Non-Functional Requirements

- Page load: < 2s (LCP)
- AI streaming response: first token < 3s
- Mobile responsive: all pages work on 375px+
- PWA: installable, push notifications for alerts
- Accessibility: WCAG 2.1 AA
- Security: RLS on all tables, no client-side secrets

---

## 12. Out of Scope (V1)

- SP-API / Flipkart API integration (V2)
- Bulk CSV listing optimization (Agency plan V2)
- Ad campaign management
- Inventory tracking
- WhatsApp notifications (V2)
- Native mobile app (V2)
- Competitor analysis

---

## 13. Success Metrics (Month 3)

- 200 registered users
- 50 paid subscribers (Pro or Agency)
- MRR: ₹50,000+
- Avg session duration: > 8 minutes
- Listing optimizer satisfaction: > 4.2/5 stars
