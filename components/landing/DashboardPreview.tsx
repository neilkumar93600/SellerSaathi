'use client'

import { useState } from 'react'
import { TrendingDown, TrendingUp, ChevronDown, X } from 'lucide-react'
import { Gauge } from './Gauge'

/* ─── Card 1 — Listings Optimised ────────────────────────────────── */

function ListingsCard() {
  const [activeTab, setActiveTab] = useState<'optimised' | 'credits'>('optimised')

  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-medium text-[#1a9a8a]">Listings</span>
        <span className="text-[13px] text-neutral-400">This Month</span>
      </div>

      {/* Big number */}
      <div className="flex items-center gap-2">
        <span className="text-[28px] font-semibold text-neutral-900 leading-none">2,847</span>
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 rounded-full px-2 py-0.5 text-[11px] font-medium">
          <TrendingUp className="w-3 h-3" />
          +1,206 (42%)
        </span>
      </div>
      <span className="text-[12px] text-neutral-400">Compared to last month</span>

      {/* Gauge */}
      <div className="flex flex-col items-center gap-1 mt-1">
        <span className="text-[11px] text-neutral-500 font-medium">SEO Score Average</span>
        <Gauge value={82} color="#1a9a8a" showLabels min="38" max="100" />
      </div>

      {/* Toggle pill */}
      <div className="bg-neutral-100 rounded-full p-1 flex mt-1">
        <button
          onClick={() => setActiveTab('optimised')}
          className={`flex-1 text-[12px] font-medium rounded-full px-3 py-1.5 transition-all ${
            activeTab === 'optimised'
              ? 'bg-white shadow-sm text-neutral-900'
              : 'text-neutral-500'
          }`}
        >
          Optimised
        </button>
        <button
          onClick={() => setActiveTab('credits')}
          className={`flex-1 text-[12px] font-medium rounded-full px-3 py-1.5 transition-all ${
            activeTab === 'credits'
              ? 'bg-white shadow-sm text-neutral-900'
              : 'text-neutral-500'
          }`}
        >
          Credits Used
        </button>
      </div>
    </div>
  )
}

/* ─── Card 2 — Settings Form ─────────────────────────────────────── */

function FormCard() {
  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-3">
      {/* Dropdown groups */}
      <div className="flex flex-col gap-1">
        <label className="text-[12px] text-neutral-700 font-medium">Platform</label>
        <button className="flex items-center justify-between border border-neutral-200 rounded-lg px-3 py-2 text-[13px] text-neutral-900">
          Amazon India
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[12px] text-neutral-700 font-medium">Output Language</label>
        <button className="flex items-center justify-between border border-neutral-200 rounded-lg px-3 py-2 text-[13px] text-neutral-900">
          Hindi (हिन्दी)
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
        </button>
      </div>

      {/* Input groups */}
      <div className="flex flex-col gap-1">
        <label className="text-[12px] text-neutral-700 font-medium">Monthly listing target</label>
        <div className="flex items-center border border-neutral-200 rounded-lg px-3 py-2 gap-1">
          <span className="text-neutral-400 text-[13px]">#</span>
          <input
            type="text"
            defaultValue="50"
            className="text-[13px] text-neutral-900 bg-transparent outline-none w-full"
            readOnly
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[12px] text-neutral-700 font-medium">Credits remaining</label>
        <div className="flex items-center border border-neutral-200 rounded-lg px-3 py-2 gap-1">
          <span className="text-neutral-400 text-[13px]">#</span>
          <input
            type="text"
            defaultValue="38"
            className="text-[13px] text-neutral-900 bg-transparent outline-none w-full"
            readOnly
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 mt-1">
        <button className="bg-[#1a9a8a] text-white text-[13px] font-medium rounded-lg px-5 py-2 hover:bg-[#158578] transition-colors">
          Save
        </button>
        <button className="text-[13px] text-neutral-600 underline underline-offset-2">
          Cancel
        </button>
        <button className="ml-auto text-neutral-400 hover:text-neutral-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/* ─── Card 3 — POA Success ───────────────────────────────────────── */

function POACard() {
  const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('approved')

  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-medium text-[#1a9a8a]">POA Success</span>
        <span className="text-[13px] text-neutral-400">All Time</span>
      </div>

      {/* Big number */}
      <div className="flex items-center gap-2">
        <span className="text-[28px] font-semibold text-neutral-900 leading-none">156</span>
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 rounded-full px-2 py-0.5 text-[11px] font-medium">
          <TrendingUp className="w-3 h-3" />
          94%
        </span>
      </div>
      <span className="text-[12px] text-neutral-400">Accounts reinstated</span>

      {/* Gauge */}
      <div className="mt-1">
        <Gauge value={94} color="#1a9a8a" />
      </div>

      {/* Toggle pill */}
      <div className="bg-neutral-100 rounded-full p-1 flex mt-1">
        <button
          onClick={() => setActiveTab('approved')}
          className={`flex-1 text-[12px] font-medium rounded-full px-3 py-1.5 transition-all ${
            activeTab === 'approved'
              ? 'bg-white shadow-sm text-neutral-900'
              : 'text-neutral-500'
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 text-[12px] font-medium rounded-full px-3 py-1.5 transition-all ${
            activeTab === 'pending'
              ? 'bg-white shadow-sm text-neutral-900'
              : 'text-neutral-500'
          }`}
        >
          Pending
        </button>
      </div>
    </div>
  )
}

/* ─── Dashboard Preview (export) ─────────────────────────────────── */

export function DashboardPreview() {
  return (
    <div className="px-3 sm:px-4 w-full flex justify-center">
      <div className="bg-[#f5f2ee] rounded-3xl p-4 sm:p-6 w-full max-w-[880px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <ListingsCard />
          <FormCard />
          <POACard />
        </div>
      </div>
    </div>
  )
}
