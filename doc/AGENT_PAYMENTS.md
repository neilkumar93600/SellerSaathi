# AGENT_PAYMENTS — Razorpay & Credits Agent

**Read:** This file + `ARCHITECTURE.md` only.

---

## Role

You own Razorpay integration, order creation, payment verification, webhook handling, and the credit purchase flow.

## Files You Own

```
lib/payments/razorpay.ts
app/api/payments/create-order/route.ts
app/api/payments/verify/route.ts
app/api/payments/buy-credits/route.ts
app/api/payments/webhook/route.ts
```

## Do NOT Touch

- `components/`, `hooks/`, `app/**/page.tsx`
- `lib/ai/`, `lib/supabase/`

---

## Razorpay Client (`lib/payments/razorpay.ts`)

```typescript
import Razorpay from 'razorpay'
import crypto from 'crypto'

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export function verifyRazorpaySignature(params: {
  order_id: string
  payment_id: string
  signature: string
}): boolean {
  const body = `${params.order_id}|${params.payment_id}`
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')
  return expected === params.signature
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')
  return expected === signature
}

// Plans config
export const PLANS = {
  pro: {
    id: 'pro',
    razorpay_plan_id: process.env.RAZORPAY_PLAN_PRO!,
    credits: 30,
    price_inr: 999,
  },
  agency: {
    id: 'agency',
    razorpay_plan_id: process.env.RAZORPAY_PLAN_AGENCY!,
    credits: 100,
    price_inr: 2499,
  },
} as const

// Credit pack pricing
export const CREDIT_PRICE_INR = 49 // per credit
export const CREDIT_PACKS = [
  { credits: 5, price_inr: 199 },
  { credits: 10, price_inr: 349 },
  { credits: 25, price_inr: 799 },
] as const
```

---

## API: Create Subscription Order (`/api/payments/create-order`)

```typescript
// Body: { plan_id: 'pro' | 'agency' }
// Returns: { subscription_id, key_id }

// Flow:
// 1. Auth check
// 2. Check if user already has active subscription → error if so
// 3. Get/create Razorpay customer using user email
// 4. Create Razorpay subscription:
//    razorpay.subscriptions.create({
//      plan_id: PLANS[plan_id].razorpay_plan_id,
//      customer_notify: 1,
//      total_count: 12,  // 12 months then renews
//    })
// 5. Insert pending payment record via supabaseAdmin
// 6. Return { subscription_id, key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID }
```

---

## API: Verify Payment (`/api/payments/verify`)

```typescript
// Body: { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, plan_id }
// Returns: { success, credits_added }

// Flow:
// 1. Auth check
// 2. Verify signature using verifyRazorpaySignature()
// 3. If invalid: return 400
// 4. Use supabaseAdmin to:
//    a. Upsert subscription row: { user_id, plan_id, status:'active', razorpay_subscription_id, ... }
//    b. Update profiles.plan = plan_id
//    c. Update profiles.credits_remaining += plan.credits
//    d. Insert credit_transaction: { type:'purchase', amount: plan.credits, description: 'Plan activation' }
//    e. Update payment record: status='captured', razorpay_payment_id
// 5. Return { success: true, credits_added: plan.credits }
```

---

## API: Buy Credits (`/api/payments/buy-credits`)

```typescript
// Body: { credits: 5 | 10 | 25 }
// Returns: { order_id, amount, currency, key_id }

// Flow:
// 1. Auth check
// 2. Validate credit pack exists in CREDIT_PACKS
// 3. Create Razorpay order:
//    razorpay.orders.create({
//      amount: pack.price_inr * 100,  // paise
//      currency: 'INR',
//      receipt: `credits_${userId}_${Date.now()}`
//    })
// 4. Insert pending payment: { type:'credits', credits_purchased: pack.credits, amount_inr: pack.price_inr, razorpay_order_id }
// 5. Return { order_id, amount: pack.price_inr * 100, currency: 'INR', key_id }
```

---

## API: Webhook (`/api/payments/webhook`)

**IMPORTANT:** Do NOT use Supabase server client here. Use `supabaseAdmin` only.
Do NOT validate auth (webhook has no user session).
DO verify webhook signature.

```typescript
// Headers: x-razorpay-signature
// Body: Razorpay webhook event JSON

// Events to handle:
// payment.captured → for credit purchases
//   - Find payment by razorpay_order_id
//   - Update payment status='captured'
//   - Add credits to user profile
//   - Insert credit_transaction

// subscription.charged → monthly renewal
//   - Find subscription by razorpay_subscription_id
//   - Update subscription current_period_start/end
//   - Reset credits: call reset_monthly_credits RPC
//   - Insert credit_transaction { type:'monthly_reset' }

// subscription.cancelled → user cancelled
//   - Update subscription status='cancelled', cancel_at_period_end=true
//   - Update profiles.plan='free' (at period end — handled next renewal)

// subscription.activated → subscription started
//   - Already handled in verify endpoint, but handle duplicates gracefully
```

---

## Webhook Route Implementation Notes

```typescript
export async function POST(request: NextRequest) {
  const body = await request.text()  // Raw text for signature verification
  const signature = request.headers.get('x-razorpay-signature') ?? ''

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)
  // Handle event.event string...

  return NextResponse.json({ received: true })
}

// Middleware matcher EXCLUDES webhook: see AGENT_BACKEND.md middleware config
```

---

## Client-Side Checkout Pattern

Components use this pattern (implemented by AGENT_FRONTEND_COMPONENTS):

```typescript
// Load Razorpay script dynamically
const script = document.createElement('script')
script.src = 'https://checkout.razorpay.com/v1/checkout.js'

// Subscription checkout
const options = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  subscription_id: subscriptionId,
  name: 'SellerSaathi',
  description: 'Pro Plan Subscription',
  image: '/icons/logo.png',
  handler: async (response) => {
    // POST to /api/payments/verify
  },
  prefill: { email: user.email, name: user.name },
  theme: { color: '#FF6B35' }  // SellerSaathi brand color
}
const rzp = new window.Razorpay(options)
rzp.open()
```

---

## Packages Required

```json
"razorpay": "^2"
```

## Env Vars Used

```
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
NEXT_PUBLIC_RAZORPAY_KEY_ID
RAZORPAY_WEBHOOK_SECRET
RAZORPAY_PLAN_PRO
RAZORPAY_PLAN_AGENCY
```
