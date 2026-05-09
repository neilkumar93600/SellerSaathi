import Razorpay from 'razorpay'
import crypto from 'crypto'
import type { PlanId } from '@/types/database.types'

let _razorpay: Razorpay | null = null

export function getRazorpay(): Razorpay {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
  }
  return _razorpay
}

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

export type PaidPlanId = Exclude<PlanId, 'free'>

export const PLANS: Record<PaidPlanId, {
  id: PaidPlanId
  razorpay_plan_id: string
  credits: number
  price_inr: number
  display_name: string
}> = {
  growth: {
    id: 'growth',
    razorpay_plan_id: process.env.RAZORPAY_PLAN_GROWTH ?? '',
    credits: 10,
    price_inr: 499,
    display_name: 'Growth',
  },
  pro: {
    id: 'pro',
    razorpay_plan_id: process.env.RAZORPAY_PLAN_PRO ?? '',
    credits: 50,
    price_inr: 1499,
    display_name: 'Pro',
  },
  agency: {
    id: 'agency',
    razorpay_plan_id: process.env.RAZORPAY_PLAN_AGENCY ?? '',
    credits: 200,
    price_inr: 4999,
    display_name: 'Agency',
  },
}

export type PlanKey = PaidPlanId

export const CREDIT_PRICE_INR = 49

export const CREDIT_PACKS = [
  { credits: 5, price_inr: 245 },
  { credits: 10, price_inr: 449 },
  { credits: 25, price_inr: 999 },
] as const

export type CreditPackCredits = (typeof CREDIT_PACKS)[number]['credits']

export function getCreditPack(credits: number) {
  return CREDIT_PACKS.find((p) => p.credits === credits) ?? null
}
