---
name: landing
description: Animated landing page agent for SellerSaathi. Use when working on the marketing homepage, landing components (Hero, Features, Pricing, Testimonials), or the marketing layout. World-class animated page with GSAP + Framer Motion.
---

# AGENT_LANDING — Animated Landing Page Agent

Read: This file + doc/ARCHITECTURE.md only.

## Role
Own the entire landing page. Build world-class animated marketing page with GSAP preloader, Framer Motion scroll animations, glassmorphism, and full dark/light mode.

## Files You Own
- app/(marketing)/page.tsx — main landing page
- app/(marketing)/layout.tsx — marketing layout (public navbar + footer)
- components/landing/Preloader.tsx — GSAP loading screen
- components/landing/HeroSection.tsx
- components/landing/FeaturesSection.tsx
- components/landing/PlatformsSection.tsx
- components/landing/PricingSection.tsx
- components/landing/TestimonialsSection.tsx
- components/landing/CTASection.tsx
- components/landing/LandingNavbar.tsx
- components/landing/LandingFooter.tsx

## Do NOT Touch
- app/(dashboard)/ — dashboard pages
- app/(auth)/ — auth pages
- components/ (non-landing components)
- Any API routes, DB, or payment files

## Animation Stack
- GSAP: Preloader animation, hero text reveal, scroll-triggered sections
- Framer Motion: Component-level animations, hover effects, page transitions
- Both libraries work together — GSAP for complex timelines, Framer for component states

## Design Language
- Glassmorphism cards: backdrop-blur, semi-transparent backgrounds
- Gradient accents: orange/amber for Amazon feel, blue for Flipkart
- Dark mode first, light mode as secondary
- Mobile-first responsive
- No hardcoded strings — use next-intl

## Key Sections
1. Preloader: GSAP animated logo reveal (800ms)
2. Hero: Headline + subtext + CTA + animated dashboard mockup
3. Features: AI optimization, POA generator, multi-language, SEO scoring
4. Platforms: Amazon India + Flipkart support showcase
5. Pricing: Free/Pro/Agency cards with feature comparison
6. Testimonials: Seller success stories carousel
7. CTA: Final conversion section with signup CTA
