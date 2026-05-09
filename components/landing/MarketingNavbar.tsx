'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Menu, X } from 'lucide-react'

/* ─── SellerSaathi Logo Mark ──────────────────────────────────────── */

function LogoMark({ className = 'w-7 h-7 sm:w-8 sm:h-8' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`grid place-items-center rounded-lg bg-[#1a9a8a] text-white font-semibold shadow-sm ${className}`}
      style={{ fontFamily: 'var(--font-heading, inherit)', fontSize: '14px' }}
    >
      S
    </span>
  )
}

/* ─── Nav items ───────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { label: 'Features', href: '#features', isActive: true },
  { label: 'How it works', href: '#how' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Reviews', href: '#testimonials' },
]

/* ─── MarketingNavbar ─────────────────────────────────────────────── */

export function MarketingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex w-full justify-center px-3 pt-4 sm:px-4 sm:pt-6">
      <div className="relative flex w-full max-w-[760px] items-center rounded-full border border-neutral-200 bg-white py-2 pr-2 pl-2 shadow-sm">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 pl-1">
          <LogoMark />
          <span
            className="hidden text-sm font-semibold tracking-tight text-neutral-900 sm:inline"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            SellerSaathi
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="ml-6 hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-1 text-[14px] font-medium transition-colors ${
                item.isActive
                  ? 'text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {item.isActive && (
                <span className="mr-0.5 h-1.5 w-1.5 rounded-full bg-[#1a9a8a]" />
              )}
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-2">
          {/* Login (desktop) */}
          <Link
            href="/login"
            className="hidden px-3 py-1.5 text-[13px] font-medium text-neutral-600 transition-colors hover:text-neutral-900 sm:inline-flex"
          >
            Login
          </Link>

          {/* CTA button */}
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-[#1a9a8a] py-1.5 pr-1.5 pl-4 text-[13px] font-medium text-white transition-colors hover:bg-[#158578]"
          >
            <span>Start Free</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          {/* Mobile hamburger */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="absolute top-full right-2 left-2 z-20 mt-2 rounded-2xl border border-neutral-200 bg-white p-3 shadow-lg md:hidden">
            <nav className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors ${
                    item.isActive
                      ? 'bg-neutral-50 text-neutral-900'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {item.isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1a9a8a]" />
                  )}
                  {item.label}
                </a>
              ))}
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[14px] font-medium text-neutral-600 hover:bg-neutral-50"
              >
                Login
              </Link>
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}
