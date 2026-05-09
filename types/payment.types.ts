export type { PlanId, PaymentType, PaymentStatus } from './database.types'

export interface CreditPack {
  credits: number
  price_inr: number
}

export type PaidPlanId = 'growth' | 'pro' | 'agency'

export interface CreateOrderResponse {
  subscription_id: string
  key_id: string
  amount: number
  currency: 'INR'
}

export interface BuyCreditsResponse {
  order_id: string
  amount: number
  currency: 'INR'
  key_id: string
}

export interface VerifyPaymentResponse {
  success: boolean
  credits_added: number
}

export interface ApiResult<T> {
  data: T | null
  error: string | null
}
