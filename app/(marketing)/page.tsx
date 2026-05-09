import type { Metadata } from 'next'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { PricingTeaser } from '@/components/landing/PricingTeaser'
import { CTASection } from '@/components/landing/CTASection'

export const metadata: Metadata = {
  title: 'SellerSaathi — AI Listing & POA Tools for Indian Sellers',
  description:
    'AI-powered listing optimiser and suspension POA generator for Amazon India and Flipkart sellers. Write in 8 Indian languages.',
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'SellerSaathi',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'AI-powered listing optimizer for Amazon India and Flipkart sellers, with multilingual support and suspension POA generation.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

export default function MarketingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <PricingTeaser />
      <TestimonialsSection />
      <CTASection />
    </>
  )
}
