import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getRazorpay, getCreditPack } from '@/lib/payments/razorpay'

const schema = z.object({
  credits: z.union([z.literal(5), z.literal(10), z.literal(25)]),
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

    const pack = getCreditPack(parsed.data.credits)
    if (!pack) {
      return NextResponse.json({ data: null, error: 'Invalid credit pack' }, { status: 400 })
    }

    const order = await getRazorpay().orders.create({
      amount: pack.price_inr * 100,
      currency: 'INR',
      receipt: `credits_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: { user_id: user.id, credits: String(pack.credits) },
    })

    await getSupabaseAdmin().from('payments').insert({
      user_id: user.id,
      type: 'credits',
      plan_id: null,
      credits_purchased: pack.credits,
      amount_inr: pack.price_inr,
      status: 'pending',
      razorpay_order_id: order.id,
      razorpay_payment_id: null,
      razorpay_signature: null,
    })

    return NextResponse.json({
      data: {
        order_id: order.id,
        amount: pack.price_inr * 100,
        currency: 'INR',
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      },
      error: null,
    })
  } catch (err) {
    console.error('[buy-credits]', err)
    return NextResponse.json({ data: null, error: 'Failed to create credit order' }, { status: 500 })
  }
}
