'use client'
import { useRef } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Check, Sparkle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface Tier {
  id: 'free' | 'pro' | 'agency'
  name: string
  priceLabel: string
  priceSub?: string
  description: string
  features: string[]
  cta: string
  href: string
  popular?: boolean
}

const TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Free',
    priceLabel: '₹0',
    priceSub: 'forever',
    description: 'Try the platform with no commitment.',
    features: [
      '3 credits to start',
      'Listing optimiser',
      'Amazon India + Flipkart',
      '8 Indian languages',
    ],
    cta: 'Start Free',
    href: '/signup',
  },
  {
    id: 'pro',
    name: 'Pro',
    priceLabel: '₹999',
    priceSub: '/month',
    description: 'For active sellers who need volume.',
    features: [
      '50 credits / month',
      'POA generator',
      'PDF export',
      'Priority email support',
    ],
    cta: 'Upgrade to Pro',
    href: '/signup?plan=pro',
    popular: true,
  },
  {
    id: 'agency',
    name: 'Agency',
    priceLabel: '₹2,499',
    priceSub: '/month',
    description: 'For agencies and high-volume teams.',
    features: [
      '200 credits / month',
      'Bulk upload',
      'Team seats',
      'Priority support',
    ],
    cta: 'Talk to sales',
    href: '/contact',
  },
]

export function PricingTeaser() {
  const rootRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(['.pricing-title', '.pricing-card', '.pricing-saving'], {
          opacity: 1,
          y: 0,
          scale: 1,
          clearProps: 'all',
        })
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.pricing-title', {
          y: 24,
          opacity: 0,
          duration: 0.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#pricing',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        })

        gsap.from('.pricing-card', {
          y: 40,
          opacity: 0,
          duration: 0.5,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#pricing',
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        })

        gsap.from('.pricing-saving', {
          scale: 0,
          opacity: 0,
          duration: 0.5,
          ease: 'back.out(2)',
          scrollTrigger: {
            trigger: '#pricing',
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        })
      })

      return () => mm.revert()
    },
    { scope: rootRef }
  )

  return (
    <section ref={rootRef} id="pricing" className="relative isolate py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="pricing-title mx-auto max-w-2xl text-center will-change-transform">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">Pricing</p>
          <h2
            className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            Simple, affordable pricing
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Replace ₹10,000/month agencies for a fraction of the cost.
          </p>
        </div>

        <div className="relative mt-12 grid gap-5 md:grid-cols-3">
          {TIERS.map((tier) => (
            <article
              key={tier.id}
              className={cn(
                'pricing-card relative flex flex-col rounded-3xl border bg-card/60 p-6 backdrop-blur-md will-change-transform',
                tier.popular ? 'border-primary/50 ring-1 ring-primary/30' : 'border-border/60'
              )}
            >
              {tier.popular && (
                <Badge className="absolute -top-2 right-5 bg-primary text-primary-foreground">
                  <Sparkle className="mr-1 h-3 w-3" /> Most popular
                </Badge>
              )}
              <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {tier.name}
              </p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span
                  className="text-4xl font-semibold tabular-nums text-foreground"
                  style={{ fontFamily: 'var(--font-heading, inherit)' }}
                >
                  {tier.priceLabel}
                </span>
                {tier.priceSub && (
                  <span className="text-sm text-muted-foreground">{tier.priceSub}</span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="mt-6"
                variant={tier.popular ? 'default' : 'outline'}
                size="lg"
              >
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>
              {tier.id === 'pro' && (
                <span className="pricing-saving absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm dark:text-emerald-300 will-change-transform">
                  Save ₹9,001/month vs agency
                </span>
              )}
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          All prices inclusive of GST. Pay securely via Razorpay.
        </p>
      </div>
    </section>
  )
}
