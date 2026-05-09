import type { Metadata } from 'next'
import { PricingTeaser } from '@/components/landing/PricingTeaser'
import { CTASection } from '@/components/landing/CTASection'

export const metadata: Metadata = {
  title: 'Pricing — SellerSaathi',
  description:
    'Simple, transparent pricing for Indian Amazon and Flipkart sellers. Free tier with 3 credits, Pro from ₹999/month.',
}

export default function PricingPage() {
  return (
    <div className="pt-24">
      <PricingTeaser />
      <CTASection />
    </div>
  )
}
