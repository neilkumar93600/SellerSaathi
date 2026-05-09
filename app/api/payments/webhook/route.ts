import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyWebhookSignature, PLANS, type PlanKey } from '@/lib/payments/razorpay'
import type { PlanId } from '@/types/database.types'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-razorpay-signature') ?? ''

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: { event: string; payload: Record<string, { entity: Record<string, unknown> }> }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  try {
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity)
        break
      case 'subscription.charged':
        await handleSubscriptionCharged(event.payload.subscription.entity, event.payload.payment?.entity)
        break
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.payload.subscription.entity)
        break
      case 'subscription.activated':
        await handleSubscriptionActivated(event.payload.subscription.entity)
        break
      default:
        // Acknowledge unhandled events to prevent retries
        break
    }
  } catch (err) {
    console.error(`[webhook:${event.event}]`, err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handlePaymentCaptured(payment: Record<string, unknown>) {
  const orderId = payment.order_id as string | undefined
  const paymentId = payment.id as string | undefined
  if (!orderId || !paymentId) return

  const { data: paymentRow } = await getSupabaseAdmin()
    .from('payments')
    .select('id, user_id, type, credits_purchased, status')
    .eq('razorpay_order_id', orderId)
    .maybeSingle()

  if (!paymentRow || paymentRow.type !== 'credits' || paymentRow.status === 'captured') {
    return
  }

  const credits = paymentRow.credits_purchased ?? 0
  if (credits <= 0) return

  const { data: profile } = await getSupabaseAdmin()
    .from('profiles')
    .select('credits_remaining')
    .eq('id', paymentRow.user_id)
    .single()

  const newCredits = (profile?.credits_remaining ?? 0) + credits

  await getSupabaseAdmin()
    .from('profiles')
    .update({ credits_remaining: newCredits })
    .eq('id', paymentRow.user_id)

  await getSupabaseAdmin().from('credit_transactions').insert({
    user_id: paymentRow.user_id,
    amount: credits,
    type: 'purchase',
    description: `Credit pack — ${credits} credits`,
    listing_id: null,
    poa_id: null,
  })

  await getSupabaseAdmin()
    .from('payments')
    .update({ status: 'captured', razorpay_payment_id: paymentId })
    .eq('id', paymentRow.id)
}

async function handleSubscriptionCharged(
  subscription: Record<string, unknown>,
  _payment?: Record<string, unknown>
) {
  const subId = subscription.id as string | undefined
  if (!subId) return

  const { data: subRow } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('id, user_id, plan_id')
    .eq('razorpay_subscription_id', subId)
    .maybeSingle()

  if (!subRow) return

  const planId = subRow.plan_id as PlanId
  const periodStart = subscription.current_start
    ? new Date((subscription.current_start as number) * 1000).toISOString()
    : new Date().toISOString()
  const periodEnd = subscription.current_end
    ? new Date((subscription.current_end as number) * 1000).toISOString()
    : null

  await getSupabaseAdmin()
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_start: periodStart,
      current_period_end: periodEnd,
    })
    .eq('id', subRow.id)

  // Reset monthly credits via RPC (handles both reset + transaction insert atomically)
  await getSupabaseAdmin().rpc('reset_monthly_credits', {
    p_user_id: subRow.user_id,
    p_plan_id: planId,
  })

  if (planId !== 'free') {
    const plan = PLANS[planId as PlanKey]
    if (plan) {
      await getSupabaseAdmin().from('credit_transactions').insert({
        user_id: subRow.user_id,
        amount: plan.credits,
        type: 'monthly_reset',
        description: `Monthly renewal — ${plan.display_name}`,
        listing_id: null,
        poa_id: null,
      })
    }
  }
}

async function handleSubscriptionCancelled(subscription: Record<string, unknown>) {
  const subId = subscription.id as string | undefined
  if (!subId) return

  await getSupabaseAdmin()
    .from('subscriptions')
    .update({ status: 'cancelled', cancel_at_period_end: true })
    .eq('razorpay_subscription_id', subId)
}

async function handleSubscriptionActivated(subscription: Record<string, unknown>) {
  const subId = subscription.id as string | undefined
  if (!subId) return

  // Idempotent: verify endpoint usually handles this first
  await getSupabaseAdmin()
    .from('subscriptions')
    .update({ status: 'active' })
    .eq('razorpay_subscription_id', subId)
}
