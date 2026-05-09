import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyRazorpaySignature, PLANS, type PlanKey } from '@/lib/payments/razorpay'

const schema = z.object({
  razorpay_payment_id: z.string().min(1),
  razorpay_subscription_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  plan_id: z.enum(['growth', 'pro', 'agency']),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ data: null, error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, plan_id } = parsed.data

    // Subscription HMAC body: payment_id + "|" + subscription_id
    const valid = verifyRazorpaySignature({
      order_id: razorpay_payment_id,
      payment_id: razorpay_subscription_id,
      signature: razorpay_signature,
    })

    if (!valid) {
      return NextResponse.json({ data: null, error: 'Invalid signature' }, { status: 400 })
    }

    const plan = PLANS[plan_id as PlanKey]
    const now = new Date().toISOString()

    const { data: profile } = await getSupabaseAdmin()
      .from('profiles')
      .select('credits_remaining')
      .eq('id', user.id)
      .single()

    const newCredits = (profile?.credits_remaining ?? 0) + plan.credits

    await getSupabaseAdmin().from('subscriptions').upsert(
      {
        user_id: user.id,
        plan_id,
        status: 'active',
        razorpay_subscription_id,
        razorpay_customer_id: null,
        cancel_at_period_end: false,
        current_period_start: now,
        current_period_end: null,
      },
      { onConflict: 'razorpay_subscription_id' }
    )

    await getSupabaseAdmin()
      .from('profiles')
      .update({ plan: plan_id, credits_remaining: newCredits })
      .eq('id', user.id)

    await getSupabaseAdmin().from('credit_transactions').insert({
      user_id: user.id,
      amount: plan.credits,
      type: 'purchase',
      description: `Plan activation — ${plan.display_name}`,
      listing_id: null,
      poa_id: null,
    })

    await getSupabaseAdmin()
      .from('payments')
      .update({
        status: 'captured',
        razorpay_payment_id,
        razorpay_signature,
      })
      .eq('razorpay_order_id', razorpay_subscription_id)

    return NextResponse.json({
      data: { success: true, credits_added: plan.credits },
      error: null,
    })
  } catch (err) {
    console.error('[verify]', err)
    return NextResponse.json({ data: null, error: 'Verification failed' }, { status: 500 })
  }
}
