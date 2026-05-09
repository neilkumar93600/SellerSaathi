'use client'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Plus, Check } from 'lucide-react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const AMAZON = [
  '200-character SEO title',
  '5 keyword-rich bullets',
  'Backend search terms (250 bytes)',
  'A9 algorithm optimised',
  'Suspension POA support',
]

const FLIPKART = [
  '100-character impactful title',
  '5 product highlights',
  'SEO description (5000 chars)',
  'Keyword tags',
  'Flipkart seller account tips',
]

export function HowItWorks() {
  const rootRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(['.platform-left', '.platform-right', '.platform-divider', '.platform-title'], {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          clearProps: 'all',
        })
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.platform-title', {
          y: 24,
          opacity: 0,
          duration: 0.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#how',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        })
        gsap.from('.platform-left', {
          x: -50,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#how',
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        })
        gsap.from('.platform-right', {
          x: 50,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#how',
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        })
        gsap.from('.platform-divider', {
          scale: 0,
          opacity: 0,
          duration: 0.4,
          ease: 'back.out(2.5)',
          scrollTrigger: {
            trigger: '#how',
            start: 'top 65%',
            toggleActions: 'play none none reverse',
          },
        })
      })

      return () => mm.revert()
    },
    { scope: rootRef }
  )

  return (
    <section ref={rootRef} id="how" className="relative isolate py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="platform-title mx-auto max-w-2xl text-center will-change-transform">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">How it works</p>
          <h2
            className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            Works with India's top 2 marketplaces
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Each platform's optimiser is tuned to the rules and ranking signals that actually move
            the needle.
          </p>
        </div>

        <div className="relative mt-12 grid gap-6 md:grid-cols-2">
          <article className="platform-left relative overflow-hidden rounded-3xl border border-orange-500/30 bg-card/60 p-7 backdrop-blur-md will-change-transform">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/15 font-semibold text-orange-600 dark:text-orange-400"
                style={{ fontFamily: 'var(--font-heading, inherit)' }}
              >
                a
              </span>
              <h3
                className="text-2xl font-semibold text-foreground"
                style={{ fontFamily: 'var(--font-heading, inherit)' }}
              >
                Amazon India
              </h3>
            </div>
            <ul className="mt-5 space-y-2.5">
              {AMAZON.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="platform-right relative overflow-hidden rounded-3xl border border-blue-500/30 bg-card/60 p-7 backdrop-blur-md will-change-transform">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/15 font-semibold text-blue-600 dark:text-blue-400"
                style={{ fontFamily: 'var(--font-heading, inherit)' }}
              >
                F
              </span>
              <h3
                className="text-2xl font-semibold text-foreground"
                style={{ fontFamily: 'var(--font-heading, inherit)' }}
              >
                Flipkart
              </h3>
            </div>
            <ul className="mt-5 space-y-2.5">
              {FLIPKART.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <div className="platform-divider pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 will-change-transform md:block">
            <div className="grid h-12 w-12 place-items-center rounded-full border border-border bg-background/90 text-primary shadow-lg backdrop-blur">
              <Plus className="h-5 w-5" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
