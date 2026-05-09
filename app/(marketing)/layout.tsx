'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { LazyMotion, domAnimation, AnimatePresence, m } from 'framer-motion'
import { Preloader } from '@/components/landing/Preloader'
import { MarketingNavbar } from '@/components/landing/MarketingNavbar'
import { MarketingFooter } from '@/components/landing/MarketingFooter'

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
    try {
      if (sessionStorage.getItem('ss_preloaded')) setLoading(false)
    } catch {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const prev = document.documentElement.style.scrollBehavior
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.documentElement.style.scrollBehavior = prev
    }
  }, [])

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait">
        {hydrated && loading && (
          <m.div
            key="preloader"
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <Preloader onComplete={() => setLoading(false)} />
          </m.div>
        )}
      </AnimatePresence>

      <div
        aria-hidden={loading}
        className="relative light bg-white"
        data-theme="light"
        style={{ colorScheme: 'light' }}
      >
        <MarketingNavbar />
        <main>{children}</main>
        <MarketingFooter />
      </div>
    </LazyMotion>
  )
}
