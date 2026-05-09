"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { DashboardPreview } from "./DashboardPreview"

export function HeroSection() {
  return (
    <div
      className="min-h-screen w-full bg-[#ededed] p-3 sm:p-4"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* Hero container — clips everything */}
      <section className="relative h-[calc(100vh-24px)] w-full overflow-hidden rounded-2xl bg-[#d9d9d9] sm:h-[calc(100vh-32px)] sm:rounded-3xl">
        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&q=60"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260424_064411_9e9d7f84-9277-41f4-ab10-59172d89e6be.mp4"
            type="video/mp4"
          />
        </video>

        {/* White overlay */}
        <div className="absolute inset-0 bg-white/10" />

        {/* Foreground content */}
        <div className="relative z-10 flex h-full w-full flex-col items-center">
          {/* Hero text content */}
          <div className="flex flex-col items-center px-4 pt-24 pb-8 text-center sm:pt-28 sm:pb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#1a9a8a]" />
              <span className="text-[13px] font-medium text-neutral-800">
                Trusted by 1,000+ Indian Sellers
              </span>
            </div>

            {/* Headline */}
            <h1
              className="mt-5 max-w-4xl text-neutral-900 sm:mt-6"
              style={{
                fontSize: "clamp(36px, 8vw, 72px)",
                lineHeight: 1.05,
                fontWeight: 500,
                letterSpacing: "-0.02em",
              }}
            >
              Aapka AI-Powered{" "}
              <span
                style={{
                  fontFamily:
                    "var(--font-serif-accent, 'Instrument Serif'), serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                }}
              >
                Seller
              </span>
              <br />
              Companion
            </h1>

            {/* Subtitle */}
            <p
              className="mt-4 max-w-xl px-2 text-neutral-700 sm:mt-6"
              style={{ fontSize: "clamp(13px, 3.5vw, 16px)" }}
            >
              Replace ₹10,000/month listing agencies. Optimise Amazon India
              &amp; Flipkart listings, generate suspension POAs, and write in 8
              Indian languages — in seconds.
            </p>

            {/* CTA button */}
            <Link
              href="/signup"
              className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#0b0f1a] py-2 pr-2 pl-6 text-[14px] font-medium text-white transition-colors hover:bg-[#1a1f2e] sm:mt-8 sm:py-2.5 sm:pl-7"
            >
              Start Free — 3 Credits
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 sm:h-7 sm:w-7">
                <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          </div>

          {/* Dashboard preview — bleeds off the bottom */}
          <div className="mt-auto w-full">
            <DashboardPreview />
          </div>
        </div>
      </section>
    </div>
  )
}
