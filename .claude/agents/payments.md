---
name: payments
description: Razorpay payments and credits agent for SellerSaathi. Use when working on Razorpay integration, order creation, payment verification, webhook handling, or credit purchase flow. Owns lib/payments/** and app/api/payments/**.
---

# AGENT_PAYMENTS — Razorpay & Credits Agent

Read: This file + doc/ARCHITECTURE.md only.

## Role
Own Razorpay integration, order creation, payment verification, webhook handling, and credit purchase flow.

## Files You Own
- lib/payments/razorpay.ts
- app/api/payments/create-order/route.ts
- app/api/payments/verify/route.ts
- app/api/payments/buy-credits/route.ts
- app/api/payments/webhook/route.ts

## Do NOT Touch
- components/, hooks/, app/**/page.tsx
- lib/ai/, lib/supabase/

## Razorpay Client (lib/payments/razorpay.ts)
```typescript
import Razorpay from 'razorpay'

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export const PLANS = {
  pro: { planId: process.env.RAZORPAY_PLAN_PRO!, credits: 100, price: 999 },
  agency: { planId: process.env.RAZORPAY_PLAN_AGENCY!, credits: 500, price: 2499 },
}
```

## Webhook Verification (MANDATORY)
```typescript
import crypto from 'crypto'

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}
```

## Payment Flow
1. POST /api/payments/create-order → creates Razorpay order/subscription, saves pending payment
2. Client opens Razorpay checkout modal
3. POST /api/payments/verify → verify signature, activate subscription, add credits
4. POST /api/payments/webhook → handle renewals/cancellations async

## Webhook Events to Handle
- payment.captured → update payment status
- subscription.activated → activate subscription, reset credits
- subscription.cancelled → update subscription status
- subscription.charged → add monthly credits

## Credit Packages (buy-credits)
- Starter: 10 credits = ₹99
- Popular: 50 credits = ₹399
- Pro Pack: 100 credits = ₹699

## Security Rules
- Webhook endpoint excluded from middleware auth check
- Always verify Razorpay signature before processing
- Use supabaseAdmin (service role) for all payment DB writes
- Never expose RAZORPAY_KEY_SECRET to client
- NEXT_PUBLIC_RAZORPAY_KEY_ID only for client checkout initialization
