// app/not-found.tsx (or pages/404.tsx)
"use client"

import Link from "next/link"
import { ArrowLeft, Home, PackageSearch } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-slate-100 p-4 md:p-8">
      {/* Main Card Container */}
      <div className="relative w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/50 bg-white/80 shadow-2xl shadow-indigo-100/50 backdrop-blur-xl">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-8 py-6 md:px-12">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <PackageSearch className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">
              SellerSaathi
            </span>
          </div>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
            <Link href="/" className="transition-colors hover:text-indigo-600">
              Home
            </Link>
            <Link
              href="/pricing"
              className="transition-colors hover:text-indigo-600"
            >
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="transition-colors hover:text-indigo-600"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              className="transition-colors hover:text-indigo-600"
            >
              Login
            </Link>
          </div>

          <Link
            href="/login"
            className="rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-indigo-300 hover:text-indigo-600"
          >
            Login
          </Link>
        </nav>

        {/* Content Area */}
        <div className="relative px-8 pt-4 pb-16 md:px-12 md:pt-8 md:pb-20">
          {/* Giant 404 Background */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none">
            <span className="text-[12rem] leading-none font-black tracking-tighter text-indigo-100/60 md:text-[20rem]">
              404
            </span>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-12 md:flex-row md:gap-16">
            {/* Character / Illustration Side */}
            <div className="flex flex-1 justify-center md:justify-end">
              <div className="relative h-72 w-72 md:h-96 md:w-96">
                {/* Decorative circles */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 opacity-60 blur-2xl" />

                {/* SVG Mascot: Friendly AI Seller Assistant */}
                <svg
                  viewBox="0 0 400 400"
                  className="relative h-full w-full drop-shadow-xl"
                >
                  {/* Body */}
                  <ellipse
                    cx="200"
                    cy="360"
                    rx="120"
                    ry="30"
                    fill="#E0E7FF"
                    opacity="0.5"
                  />

                  {/* Character body */}
                  <rect
                    x="130"
                    y="180"
                    width="140"
                    height="140"
                    rx="40"
                    fill="url(#bodyGrad)"
                  />
                  <defs>
                    <linearGradient
                      id="bodyGrad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>

                  {/* Head */}
                  <rect
                    x="150"
                    y="100"
                    width="100"
                    height="90"
                    rx="35"
                    fill="white"
                    stroke="#E0E7FF"
                    strokeWidth="3"
                  />

                  {/* Eyes */}
                  <circle cx="175" cy="140" r="12" fill="#1E293B" />
                  <circle cx="225" cy="140" r="12" fill="#1E293B" />
                  <circle cx="178" cy="137" r="4" fill="white" />
                  <circle cx="228" cy="137" r="4" fill="white" />

                  {/* Confused mouth */}
                  <ellipse cx="200" cy="165" rx="6" ry="8" fill="#1E293B" />

                  {/* Antenna */}
                  <line
                    x1="200"
                    y1="100"
                    x2="200"
                    y2="70"
                    stroke="#CBD5E1"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <circle cx="200" cy="65" r="8" fill="#EF4444" opacity="0.8" />
                  <circle cx="200" cy="65" r="8" fill="#EF4444" opacity="0.3">
                    <animate
                      attributeName="r"
                      values="8;14;8"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.3;0;0.3"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Arms holding a package */}
                  <path
                    d="M130 240 Q110 260 120 280"
                    stroke="#6366F1"
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M270 240 Q290 260 280 280"
                    stroke="#6366F1"
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Package box */}
                  <rect
                    x="160"
                    y="250"
                    width="80"
                    height="60"
                    rx="6"
                    fill="#F59E0B"
                    stroke="#D97706"
                    strokeWidth="2"
                  />
                  <line
                    x1="160"
                    y1="280"
                    x2="240"
                    y2="280"
                    stroke="#D97706"
                    strokeWidth="2"
                  />
                  <line
                    x1="200"
                    y1="250"
                    x2="200"
                    y2="310"
                    stroke="#D97706"
                    strokeWidth="2"
                  />

                  {/* Question marks floating */}
                  <text
                    x="100"
                    y="120"
                    fontSize="40"
                    fill="#CBD5E1"
                    fontWeight="bold"
                  >
                    ?
                  </text>
                  <text
                    x="280"
                    y="100"
                    fontSize="32"
                    fill="#CBD5E1"
                    fontWeight="bold"
                  >
                    ?
                  </text>
                </svg>
              </div>
            </div>

            {/* Text Content Side */}
            <div className="max-w-lg flex-1 text-center md:text-left">
              <h1 className="mb-4 text-4xl leading-tight font-extrabold text-slate-900 md:text-5xl">
                Whoops! This Page is{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Out of Stock
                </span>
              </h1>

              <p className="mb-8 text-lg leading-relaxed text-slate-500">
                Looks like our little AI assistant searched every warehouse but
                couldn&apos;t find this address. Maybe it got lost in transit or
                the listing was deactivated!
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row md:justify-start">
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-3 rounded-full bg-slate-900 px-8 py-4 font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/30"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-colors group-hover:bg-white/30">
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </div>
                  Back to Dashboard
                </Link>

                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-4 font-medium text-slate-600 transition-colors hover:text-indigo-600"
                >
                  <Home className="h-4 w-4" />
                  Return Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
