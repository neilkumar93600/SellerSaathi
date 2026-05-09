'use client'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Sparkles, FileWarning, BarChart3, Globe } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { SEOScore } from '@/components/shared/SEOScore'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const LANGS = [
  { code: 'hi', label: 'हिन्दी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'mr', label: 'मराठी' },
  { code: 'gu', label: 'ગુજરાતી' },
]

export function FeaturesSection() {
  const rootRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(['.features-title', '.feature-card'], { opacity: 1, y: 0, clearProps: 'all' })
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.features-title', {
          y: 28,
          opacity: 0,
          duration: 0.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#features',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        })

        gsap.from('.feature-card', {
          y: 50,
          opacity: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#features',
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        })
      })

      return () => mm.revert()
    },
    { scope: rootRef }
  )

  return (
    <section
      ref={rootRef}
      id="features"
      className="relative isolate py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="features-title mx-auto max-w-2xl text-center will-change-transform">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">Features</p>
          <h2
            className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            Everything you need to win on Indian marketplaces
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Built around the actual jobs Amazon and Flipkart sellers do every week.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3 md:grid-rows-2">
          <article className="feature-card group relative col-span-1 overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-md md:col-span-2 md:row-span-1">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div className="space-y-3">
                <span className="inline-grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Sparkles className="h-5 w-5" />
                </span>
                <h3
                  className="text-2xl font-semibold text-foreground"
                  style={{ fontFamily: 'var(--font-heading, inherit)' }}
                >
                  AI Listing Optimiser
                </h3>
                <p className="text-sm text-muted-foreground">
                  Transform weak listings into top-ranked products on Amazon India and Flipkart in
                  one click. SEO-tuned title, bullets, and backend keywords.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <SEOScore score={38} label="Before" size={64} />
                <span className="text-2xl text-muted-foreground" aria-hidden>
                  →
                </span>
                <SEOScore score={82} label="After" size={64} />
              </div>
            </div>
          </article>

          <article className="feature-card group relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-md">
            <span className="inline-grid h-11 w-11 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <FileWarning className="h-5 w-5" />
            </span>
            <h3
              className="mt-3 text-xl font-semibold text-foreground"
              style={{ fontFamily: 'var(--font-heading, inherit)' }}
            >
              Suspension POA Generator
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Professional Plan of Action for account reinstatement — in minutes, not days.
            </p>
            <span className="mt-4 inline-flex items-center rounded-full border border-border bg-background/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              Costs 2 credits
            </span>
          </article>

          <article className="feature-card group relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-md">
            <span className="inline-grid h-11 w-11 place-items-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="h-5 w-5" />
            </span>
            <h3
              className="mt-3 text-xl font-semibold text-foreground"
              style={{ fontFamily: 'var(--font-heading, inherit)' }}
            >
              Seller Dashboard
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Track listings, credits, and performance in one clean bento dashboard.
            </p>
            <div className="mt-4 flex h-16 items-end gap-1.5">
              {[35, 55, 42, 70, 60, 88, 76].map((h, i) => (
                <span
                  key={i}
                  className={cn(
                    'flex-1 rounded-md',
                    i === 5 ? 'bg-primary' : 'bg-primary/30'
                  )}
                  style={{ height: `${h}%` }}
                  aria-hidden
                />
              ))}
            </div>
          </article>

          <article className="feature-card group relative col-span-1 overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-md md:col-span-2">
            <div className="flex items-start gap-4">
              <span className="inline-grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Globe className="h-5 w-5" />
              </span>
              <div>
                <h3
                  className="text-2xl font-semibold text-foreground"
                  style={{ fontFamily: 'var(--font-heading, inherit)' }}
                >
                  Write in 8 Indian languages
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Generate listings in Hindi, Bengali, Tamil, Telugu, Kannada, Marathi, and Gujarati
                  — fluent enough for buyers, optimised for marketplace search.
                </p>
              </div>
            </div>
            <ul className="mt-5 flex flex-wrap gap-2">
              {LANGS.map((l) => (
                <li
                  key={l.code}
                  className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-foreground"
                >
                  {l.label}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  )
}
