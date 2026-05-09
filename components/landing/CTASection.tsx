'use client'
import { useRef } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BackgroundOrbs } from './BackgroundOrbs'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function CTASection() {
  const rootRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('.cta-content', { opacity: 1, scale: 1, clearProps: 'all' })
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.cta-content', {
          scale: 0.96,
          opacity: 0,
          duration: 0.6,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: '.cta-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        })
      })

      return () => mm.revert()
    },
    { scope: rootRef }
  )

  return (
    <section ref={rootRef} className="cta-section relative isolate py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-emerald-700 p-8 text-primary-foreground shadow-2xl shadow-primary/30 sm:p-12 md:p-16">
          <BackgroundOrbs variant="cta" />
          <div className="cta-content relative z-10 mx-auto max-w-2xl text-center will-change-transform">
            <h2
              className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl"
              style={{ fontFamily: 'var(--font-heading, inherit)' }}
            >
              Start optimising your listings today
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-pretty text-base text-primary-foreground/85 sm:text-lg">
              3 free credits. No credit card required. 2 minutes to set up.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-background text-primary hover:bg-background/90"
              >
                <Link href="/signup">
                  Start Free — 3 Credits
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Link
                href="/login"
                className="text-sm font-medium text-primary-foreground/90 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground rounded"
              >
                Already have an account? Login
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-primary-foreground/70">
              <span>Amazon India</span>
              <span aria-hidden>·</span>
              <span>Flipkart</span>
              <span aria-hidden>·</span>
              <span>8 Indian languages</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
