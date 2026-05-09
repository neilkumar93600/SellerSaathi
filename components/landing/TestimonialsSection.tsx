'use client'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Star } from 'lucide-react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface Testimonial {
  name: string
  city: string
  role: string
  quote: string
  initials: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Rajesh Sharma',
    city: 'Delhi',
    role: 'Amazon FBA Seller, Electronics',
    quote:
      'My listing SEO score went from 32 to 88 in one click. Sales doubled in 2 weeks.',
    initials: 'RS',
  },
  {
    name: 'Priya Nair',
    city: 'Kochi',
    role: 'D2C Brand Owner, Fashion',
    quote:
      'Generated my Flipkart listings in Malayalam for the first time. Game changer!',
    initials: 'PN',
  },
  {
    name: 'Mohammed Aslam',
    city: 'Hyderabad',
    role: 'Reseller, Home & Kitchen',
    quote:
      'Got my suspended account reinstated in 3 days with the POA generator. Saved my business.',
    initials: 'MA',
  },
  {
    name: 'Sunita Patel',
    city: 'Ahmedabad',
    role: 'Seller Agency Owner',
    quote:
      'Managing 20+ seller accounts. SellerSaathi replaced our ₹2L/month agency tools.',
    initials: 'SP',
  },
  {
    name: 'Arjun Reddy',
    city: 'Bangalore',
    role: 'D2C Electronics Brand',
    quote:
      'The Flipkart listing optimizer understood Indian buyer psychology better than our copywriter.',
    initials: 'AR',
  },
  {
    name: 'Meera Krishnan',
    city: 'Chennai',
    role: 'Grocery Seller',
    quote:
      'Tamil language listing generation is perfect. My regional customers find my products easily now.',
    initials: 'MK',
  },
]

export function TestimonialsSection() {
  const rootRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(['.testimonial-title', '.testimonial-card'], {
          opacity: 1,
          x: 0,
          y: 0,
          clearProps: 'all',
        })
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.testimonial-title', {
          y: 24,
          opacity: 0,
          duration: 0.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#testimonials',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        })

        gsap.from('.testimonial-card', {
          x: 32,
          opacity: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#testimonials',
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
    <section ref={rootRef} id="testimonials" className="relative isolate py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="testimonial-title mx-auto max-w-2xl text-center will-change-transform">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">Testimonials</p>
          <h2
            className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            Trusted by Indian sellers
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Real results from real sellers across India.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <article
              key={t.name}
              className="testimonial-card flex h-full flex-col rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-md will-change-transform"
            >
              <div className="flex items-center gap-3">
                <div
                  aria-hidden
                  className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary"
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.name} <span className="text-muted-foreground">· {t.city}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-0.5 text-amber-500" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" aria-hidden />
                ))}
              </div>
              <blockquote className="mt-3 text-sm leading-relaxed text-foreground">
                "{t.quote}"
              </blockquote>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
