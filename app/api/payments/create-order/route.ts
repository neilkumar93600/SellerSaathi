import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getRazorpay, PLANS, type PlanKey } from '@/lib/payments/razorpay'

const schema = z.object({
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

    const { plan_id } = parsed.data
    const plan = PLANS[plan_id as PlanKey]

    if (!plan.razorpay_plan_id) {
      return NextResponse.json(
        { data: null, error: 'Plan not configured' },
        { status: 500 }
      )
    }

    const { data: existing } = await getSupabaseAdmin()
      .from('subscriptions')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { data: null, error: 'Active subscription already exists' },
        { status: 400 }
      )
    }

    const subscription = await getRazorpay().subscriptions.create({
      plan_id: plan.razorpay_plan_id,
      customer_notify: 1,
      total_count: 12,
      notes: { user_id: user.id, plan_id },
    })

    await getSupabaseAdmin().from('payments').insert({
      user_id: user.id,
      type: 'subscription',
      plan_id,
      credits_purchased: null,
      amount_inr: plan.price_inr,
      status: 'pending',
      razorpay_order_id: subscription.id,
      razorpay_payment_id: null,
      razorpay_signature: null,
    })

    return NextResponse.json({
      data: {
        subscription_id: subscription.id,
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: plan.price_inr * 100,
        currency: 'INR',
      },
      error: null,
    })
  } catch (err) {
    console.error('[create-order]', err)
    return NextResponse.json({ data: null, error: 'Failed to create order' }, { status: 500 })
  }
}
