# AGENT_LANDING — Animated Landing Page Agent

**Read:** This file + `ARCHITECTURE.md` only.

---

## Role
You own the entire landing page. One file, one purpose. Build a world-class animated marketing page with GSAP preloader, Framer Motion scroll animations, glassmorphism, and full dark/light mode.

## Files You Own
```
app/(marketing)/page.tsx          ← main landing page
app/(marketing)/layout.tsx        ← marketing layout (public navbar + footer)
components/landing/Preloader.tsx  ← GSAP loading screen
components/landing/HeroSection.tsx
components/landing/FeaturesSection.tsx
components/landing/PlatformsSection.tsx
components/landing/PricingSection.tsx
components/landing/TestimonialsSection.tsx
components/landing/CTASection.tsx
components/landing/LandingNavbar.tsx
components/landing/LandingFooter.tsx
```

## Do NOT Touch
- `app/(dashboard)/` — dashboard pages
- `app/(auth)/` — auth pages
- `components/` (non-landing components)
- Any API routes, DB, or payment files

---

## Required Assets — Create / Source These

### Images needed (place in `public/images/landing/`):

| File | Size | Description |
|---|---|---|
| `hero-dashboard.png` | 1200×750px | Screenshot of SellerSaathi dashboard (bento grid, glass cards, listings page). Use a high-quality mockup tool like Shots.so or Screely. Dark bg preferred. |
| `hero-dashboard-dark.png` | 1200×750px | Same but dark mode variant |
| `listing-before.png` | 600×400px | Screenshot of a generic Amazon listing before optimization (low SEO score) |
| `listing-after.png` | 600×400px | Same listing after optimization (high SEO score, polished) |
| `poa-result.png` | 600×500px | Screenshot of POA result section |
| `amazon-logo.svg` | SVG | Amazon India logo — download from official press kit or use text "amazon" with smile |
| `flipkart-logo.svg` | SVG | Flipkart logo — use official SVG |
| `avatar-1.jpg` through `avatar-6.jpg` | 80×80px each | Indian seller persona portraits — use AI-generated faces from thispersondoesnotexist.com or similar |
| `og-image.png` | 1200×630px | Open Graph image — SellerSaathi logo + tagline on green gradient bg |

### Icons (inline SVG — no image files needed):
- SellerSaathi logo: leaf+spark SVG (see AGENT_FRONTEND_COMPONENTS Logo spec)
- Feature icons: use @tabler/icons-react (ti-sparkles, ti-file-alert, ti-chart-bar)
- Platform "A" and "F" lettermarks: simple inline SVG

### Video (optional — for hero section):
| File | Size | Description |
|---|---|---|
| `hero-demo.mp4` | <5MB, 1280×800 | 15-second screen recording of listing optimization flow. Loop. Muted. If not available, use hero-dashboard.png instead. |

---

## Tech Stack for Landing Page
```
GSAP 3         → Preloader animation, complex timelines
Framer Motion 11 → Section scroll animations, hover effects, page transitions
next-themes    → Dark/light toggle in LandingNavbar
Poppins + Play → Via Google Fonts (already loaded in root layout)
Tailwind v4    → Styling
CSS Custom Properties → Theme tokens (same as globals.css)
```

---

## 1. Preloader (`components/landing/Preloader.tsx`)

### Behavior
1. Shows immediately on first page load (localStorage check — skip if visited before)
2. Covers full screen: dark green bg (`#030f09`)
3. GSAP timeline plays (1.8s total)
4. Curtain wipes away revealing the loaded page beneath
5. Mark visited in localStorage: `localStorage.setItem('ss_visited', '1')`

### GSAP Animation Timeline
```typescript
'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

// Component renders:
// - Full screen overlay div (ref: overlayRef)
// - Logo SVG centered (ref: logoRef) — leaf+spark path
// - Counter text "0%" → "100%" (ref: counterRef)
// - Horizontal wipe bar (ref: wipeRef)

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<SVGSVGElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const wipeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const visited = localStorage.getItem('ss_visited')
    if (visited) { onComplete(); return }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: () => {
        localStorage.setItem('ss_visited', '1')
        onComplete()
      }})

      // 1. Logo SVG path draw (stroke-dasharray trick)
      const paths = logoRef.current?.querySelectorAll('path')
      if (paths) {
        paths.forEach(path => {
          const len = (path as SVGPathElement).getTotalLength()
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, fill: 'transparent', stroke: '#10b981', strokeWidth: 2 })
        })
        tl.to(paths, { strokeDashoffset: 0, duration: 0.8, stagger: 0.15, ease: 'power2.inOut' })
        // Fill paths after draw
        tl.to(paths, { fill: '#059669', stroke: 'transparent', duration: 0.3 }, '-=0.2')
      }

      // 2. Logo scale + bounce
      tl.from(logoRef.current, { scale: 0.8, duration: 0.4, ease: 'back.out(2)' }, '-=0.6')

      // 3. Counter counts 0 → 100
      const obj = { val: 0 }
      tl.to(obj, {
        val: 100,
        duration: 1,
        ease: 'power1.inOut',
        onUpdate: () => { if (counterRef.current) counterRef.current.textContent = Math.round(obj.val) + '%' }
      }, 0.2)

      // 4. Horizontal wipe line grows
      tl.fromTo(wipeRef.current, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'power2.inOut', transformOrigin: 'left' }, 0.2)

      // 5. Curtain splits: top half goes up, bottom half goes down
      tl.to('.preloader-top', { y: '-100%', duration: 0.6, ease: 'power3.inOut' })
      tl.to('.preloader-bottom', { y: '100%', duration: 0.6, ease: 'power3.inOut' }, '<')

    }, overlayRef)

    return () => ctx.revert()
  }, [onComplete])

  // JSX structure:
  // <div ref={overlayRef}>
  //   <div className="preloader-top" style={top half, fixed, bg #030f09, z-[9999]} />
  //   <div className="preloader-bottom" style={bottom half, fixed, bg #030f09, z-[9999]} />
  //   <div style={center overlay, fixed, z-[9999], flex center col}>
  //     <svg ref={logoRef}> ... leaf+spark paths ... </svg>
  //     <span ref={counterRef} style={Play font, 48px, #10b981}>0%</span>
  //     <div ref={wipeRef} style={width:200px, h:2px, bg:#10b981, mt:16px, origin-left}} />
  //   </div>
  // </div>
}
```

---

## 2. Marketing Layout (`app/(marketing)/layout.tsx`)
```tsx
'use client'
import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Preloader } from '@/components/landing/Preloader'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { LandingFooter } from '@/components/landing/LandingFooter'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  // Check localStorage on client to skip preloader if visited
  useEffect(() => {
    if (localStorage.getItem('ss_visited')) setLoading(false)
  }, [])

  return (
    <>
      <AnimatePresence>{loading && <Preloader onComplete={() => setLoading(false)} />}</AnimatePresence>
      {!loading && (
        <>
          <LandingNavbar />
          <main>{children}</main>
          <LandingFooter />
        </>
      )}
    </>
  )
}
```

---

## 3. Landing Navbar (`LandingNavbar.tsx`)
```tsx
'use client'
// Sticky top-0 z-50
// Background: transparent → glass on scroll (useScrollY from framer-motion)
//   useMotionValue + useTransform: scrollY [0,80] → bg-opacity [0, 0.8] + blur [0, 12px]
// Logo (md size)
// Center links: Features | Platforms | Pricing | Blog (smooth scroll to section IDs)
// Right: ThemeToggle + "Login" ghost btn + "Start Free" primary btn
// Mobile: hamburger menu — AnimatePresence slide down drawer
// Framer Motion: mount y=-80 → y=0 duration 0.5 delay 0.2 (after preloader)
```

---

## 4. Main Landing Page (`app/(marketing)/page.tsx`)
```tsx
// Server component — renders all section components
// Section order:
// 1. HeroSection
// 2. FeaturesSection
// 3. PlatformsSection
// 4. PricingSection
// 5. TestimonialsSection
// 6. CTASection
//
// IDs on each section wrapper for smooth scroll:
// id="features" | id="platforms" | id="pricing" | id="testimonials"
```

---

## 5. Hero Section (`HeroSection.tsx`)

### Layout
```
Left column (55%):
  - Pill badge: "✦ Trusted by 1,000+ Indian Sellers"
  - H1 headline (split into words for stagger animation)
  - Subtext paragraph
  - CTA buttons row
  - Platform trust logos row (Amazon India + Flipkart)

Right column (45%):
  - Dashboard mockup image (floating, with reflection)
  - Floating stat chips around the image
```

### GSAP Animation (on mount, after preloader)
```typescript
// Import gsap + ScrollTrigger
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

useEffect(() => {
  const ctx = gsap.context(() => {
    // Hero enter timeline (runs once, triggered by preloader complete)
    const tl = gsap.timeline({ delay: 0.3 })

    // Badge slides down
    tl.from('.hero-badge', { y: -20, opacity: 0, duration: 0.4, ease: 'back.out(2)' })

    // Headline words stagger up
    tl.from('.hero-word', { y: 40, opacity: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out' }, '-=0.2')

    // Subtext fade
    tl.from('.hero-sub', { y: 20, opacity: 0, duration: 0.4 }, '-=0.3')

    // CTA buttons scale in
    tl.from('.hero-cta', { scale: 0.9, opacity: 0, duration: 0.4, stagger: 0.1, ease: 'back.out(1.5)' }, '-=0.2')

    // Platform logos
    tl.from('.hero-logo', { x: -20, opacity: 0, duration: 0.3, stagger: 0.1 }, '-=0.2')

    // Dashboard image slides in from right
    tl.from('.hero-image', { x: 60, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.6')

    // Floating stat chips pop in
    tl.from('.hero-chip', { scale: 0, opacity: 0, duration: 0.3, stagger: 0.15, ease: 'back.out(2)' }, '-=0.4')

    // Hero image subtle float (infinite)
    gsap.to('.hero-image', {
      y: -12, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.5
    })
  })
  return () => ctx.revert()
}, [])
```

### Headline (split for word animation)
```tsx
const headline = "Aapka AI-Powered Seller Companion"
// Split into spans: headline.split(' ').map(word => <span className="hero-word inline-block mr-2">{word}</span>)
// H1: font-family Play, text-5xl lg:text-6xl font-bold
// "AI-Powered" — colored in var(--color-primary) with underline decoration
```

### Floating Stat Chips (absolute positioned around dashboard image)
```tsx
// 3 chips — glass cards, absolute positioned:
// Chip 1 (top-left of image): "SEO Score 38 → 82 ↑" — green
// Chip 2 (bottom-right): "₹10K agency replaced" — indigo
// Chip 3 (top-right): "POA Approved ✓" — emerald
// Each: rounded-2xl glass p-3, Play font for number, Poppins for label
// Framer Motion whileHover scale 1.05
```

### Background
```tsx
// Radial gradient orbs (CSS, no images):
// Orb 1: top-right, 600px, var(--color-primary)/8, blur-3xl
// Orb 2: bottom-left, 500px, var(--color-accent)/6, blur-3xl
// Animated: GSAP gsap.to() x/y movement, duration 8s, repeat -1, yoyo true
// Grid pattern: subtle SVG grid (inline) at 5% opacity
```

---

## 6. Features Section (`FeaturesSection.tsx`)

### GSAP ScrollTrigger animation
```typescript
// Each feature card: ScrollTrigger
gsap.from('.feature-card', {
  y: 50, opacity: 0, duration: 0.6, stagger: 0.15,
  ease: 'power3.out',
  scrollTrigger: { trigger: '#features', start: 'top 75%' }
})
// Section title: ScrollTrigger fade up
gsap.from('.features-title', {
  y: 30, opacity: 0, duration: 0.5,
  scrollTrigger: { trigger: '#features', start: 'top 80%' }
})
```

### Content — 3 Feature Cards (bento grid, first card wider)
```
Card 1 (wide, 2/3 width): Listing Optimizer
  Icon: ti-sparkles (large, 48px, green circle bg)
  Title: "AI Listing Optimizer"
  Body: "Transform weak listings into top-ranked products on Amazon India & Flipkart."
  Visual: before/after comparison mini-mockup (listing-before.png → listing-after.png)
  SEOScore component: 38 → 82

Card 2 (1/3 width): POA Generator
  Icon: ti-file-alert (amber circle)
  Title: "Suspension POA Generator"
  Body: "Professional Plan of Action for account reinstatement — in minutes, not days."
  Tag: "Costs 2 credits"

Card 3 (1/3 width): Analytics Dashboard
  Icon: ti-chart-bar (indigo circle)
  Title: "Seller Dashboard"
  Body: "Track listings, credits, and performance in one clean bento dashboard."
  Visual: mini chart SVG (simple bar chart, green bars)

Card 4 (wide, 2/3 width): Multi-language
  Icon: flag emojis row
  Title: "8 Indian Languages"
  Body: "Generate listings in Hindi, Bengali, Tamil, Telugu, Kannada, Marathi, and Gujarati."
  Language pills row: hi / bn / ta / te / kn / mr / gu
```

---

## 7. Platforms Section (`PlatformsSection.tsx`)

### Animation
```typescript
// Left panel slides from left, right panel from right
gsap.from('.platform-left', {
  x: -60, opacity: 0, duration: 0.7, ease: 'power3.out',
  scrollTrigger: { trigger: '#platforms', start: 'top 70%' }
})
gsap.from('.platform-right', {
  x: 60, opacity: 0, duration: 0.7, ease: 'power3.out',
  scrollTrigger: { trigger: '#platforms', start: 'top 70%' }
})
```

### Content
```
Section heading: "Works with India's top 2 marketplaces"

Left glass card (Amazon India):
  amazon-logo.svg (120px wide)
  "Amazon India" in Play bold
  Key optimizations list:
    ✓ 200-char SEO title
    ✓ 5 keyword-rich bullets
    ✓ Backend search terms (250 bytes)
    ✓ A9 algorithm optimized
    ✓ Suspension POA support
  Orange accent: border-orange-200 ring-orange-100

Right glass card (Flipkart):
  flipkart-logo.svg (120px wide)
  "Flipkart" in Play bold
  Key optimizations:
    ✓ 100-char impactful title
    ✓ 5 highlights
    ✓ SEO description (5000 chars)
    ✓ Keyword tags
    ✓ Flipkart seller account tips
  Blue accent: border-blue-200 ring-blue-100

Center divider: "+" icon in glass circle (absolute, overlapping both cards)
```

---

## 8. Pricing Section (`PricingSection.tsx`)

### Animation
```typescript
gsap.from('.pricing-card', {
  y: 40, opacity: 0, duration: 0.5, stagger: 0.12,
  scrollTrigger: { trigger: '#pricing', start: 'top 75%' }
})
```

### Content
```
Heading: "Simple, affordable pricing"
Subheading: "Replace ₹10,000/month agencies for a fraction of the cost"

3 PlanCard components (from shared components):
  Free | Pro (featured) | Agency

Below cards:
  "All prices inclusive of GST" note
  "Pay securely with Razorpay" + Razorpay logo

Credit pack section:
  "Need more credits? Buy a pack"
  CreditPurchase component

Framer Motion: Floating "Save vs Agency" badge appears after Pro card renders
  "Save ₹9,001/month vs agency" pill, animated scale-in
```

---

## 9. Testimonials Section (`TestimonialsSection.tsx`)

### Animation
```typescript
// Cards scroll horizontally with GSAP on desktop, stagger on mobile
gsap.from('.testimonial-card', {
  x: 40, opacity: 0, duration: 0.5, stagger: 0.1,
  scrollTrigger: { trigger: '#testimonials', start: 'top 80%' }
})
```

### Content — 6 Testimonials (2 rows of 3)
```
Each card: glass card, rounded-2xl
  Avatar: avatar-1.jpg through avatar-6.jpg (40px circle)
  Name: Poppins medium
  Role: "Amazon India Seller, Electronics" etc
  Stars: 5 yellow stars (ti-star-filled × 5)
  Quote: 2-3 line testimonial

Testimonial data (hardcoded, realistic):
1. Rajesh Sharma, Delhi
   "Amazon FBA Seller, Electronics"
   "My listing SEO score went from 32 to 88 in one click. Sales doubled in 2 weeks."

2. Priya Nair, Kochi
   "D2C Brand Owner, Fashion"
   "Generated my Flipkart listings in Malayalam for the first time. Game changer!"

3. Mohammed Aslam, Hyderabad
   "Reseller, Home & Kitchen"
   "Got my suspended account reinstated in 3 days with the POA generator. Saved my business."

4. Sunita Patel, Ahmedabad
   "Seller Agency Owner"
   "Managing 20+ seller accounts. SellerSaathi replaced our ₹2L/month agency tools."

5. Arjun Reddy, Bangalore
   "D2C Electronics Brand"
   "The Flipkart listing optimizer understood Indian buyer psychology better than our copywriter."

6. Meera Krishnan, Chennai
   "Grocery Seller"
   "Tamil language listing generation is perfect. My regional customers find my products easily now."

Header: "Trusted by Indian sellers"
Sub: "Real results from real sellers across India"
```

---

## 10. CTA Section (`CTASection.tsx`)

### Animation
```typescript
gsap.from('.cta-content', {
  scale: 0.95, opacity: 0, duration: 0.6, ease: 'back.out(1.2)',
  scrollTrigger: { trigger: '.cta-section', start: 'top 80%' }
})
```

### Content
```
Full-width section with animated gradient bg:
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)

Glassmorphism inner card (white glass on colored bg):
  Heading (Play, white, 40px): "Start optimizing your listings today"
  Sub (white/80%): "3 free credits. No credit card required. 2 minutes to set up."
  CTA button: white bg + primary text "Start Free — 3 Credits"
  Secondary: "Already have an account? Login" link

Animated background orbs inside CTA section:
  GSAP infinite drift on 2-3 orbs (scale + position)

Platform logos row below button: Amazon India + Flipkart, white tint
```

---

## 11. Landing Footer (`LandingFooter.tsx`)
```tsx
// 4 column grid:
// Col 1: Logo + tagline + social icons (if added later — placeholder)
// Col 2: Product (Features, Pricing, Blog)
// Col 3: Company (About, Contact, Privacy, Terms)
// Col 4: Languages (LanguageSelect component)
// Bottom bar: "© 2025 SellerSaathi. Made with ♥ in India."
// Supabase + Vercel + Razorpay "Powered by" logos (small, muted)
// bg-[var(--color-bg-card)] backdrop-blur border-t border-[var(--color-border-glass)]
```

---

## Scroll Behavior Setup

Add to landing page:
```typescript
// Smooth scroll for anchor links
useEffect(() => {
  document.documentElement.style.scrollBehavior = 'smooth'
  return () => { document.documentElement.style.scrollBehavior = 'auto' }
}, [])
```

GSAP ScrollTrigger setup (add once in main page component):
```typescript
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}
```

---

## Packages Required
```json
"gsap": "^3",
"framer-motion": "^11",
"next-themes": "^0.4"
```

---

## Image Placeholder Strategy
If actual screenshots aren't ready yet, use this in development:
```tsx
// Placeholder div styled as mockup:
<div className="rounded-2xl glass aspect-video flex items-center justify-center">
  <div className="text-center">
    <div className="text-6xl mb-2">📊</div>
    <p className="text-sm text-muted">Dashboard screenshot here</p>
    <p className="text-xs text-muted">1200×750px</p>
  </div>
</div>
```
Replace with `next/image` + actual screenshots before launch.

---

## SEO for Landing Page
Add to `HeroSection` or page metadata:
```tsx
// Schema markup (JSON-LD) for SoftwareApplication
const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "SellerSaathi",
  "applicationCategory": "BusinessApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
  "operatingSystem": "Web",
  "description": "AI-powered listing optimizer for Amazon India and Flipkart sellers"
}
// Add via <script type="application/ld+json"> in layout
```
