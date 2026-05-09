'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PlanCard } from '@/components/billing/PlanCard'
import { CreditPurchase } from '@/components/billing/CreditPurchase'
import { CreditMeter } from '@/components/dashboard/CreditMeter'
import { Skeleton } from '@/components/ui/skeleton'
import { useCredits } from '@/hooks/use-credits'
import { formatINR } from '@/lib/utils/format'
import type { Plan, Payment } from '@/types/database.types'

export default function BillingPage() {
  const router = useRouter()
  const { credits, plan } = useCredits()
  const [plans, setPlans] = useState<Plan[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [purchaseLoading, setPurchaseLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('plans').select('*').order('monthly_price_inr'),
      supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10),
    ]).then(([{ data: p }, { data: pay }]) => {
      setPlans(p ?? [])
      setPayments(pay ?? [])
      setLoading(false)
    })
  }, [])

  const creditsTotal =
    plan === 'agency' ? 500 : plan === 'pro' ? 150 : plan === 'growth' ? 50 : 10
  const creditsUsed = creditsTotal - credits

  async function handleCreditPurchase(creditCount: number, priceInr: number) {
    setPurchaseLoading(true)
    try {
      const res = await fetch('/api/payments/buy-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits: creditCount, price_inr: priceInr }),
      })
      const data = await res.json()
      if (data.order_id) router.push(`/dashboard/billing?order_id=${data.order_id}`)
    } finally {
      setPurchaseLoading(false)
    }
  }

  async function handleUpgrade(planId: string) {
    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId }),
      })
      const data = await res.json()
      if (data.order_id) window.location.href = data.checkout_url ?? '/dashboard/billing'
    } catch {}
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32 rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  const upgradablePlans = plans.filter((p) => p.id !== plan)

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your plan and credits</p>
      </div>

      <CreditMeter used={creditsUsed} total={creditsTotal} plan={plan} className="max-w-sm" />

      {upgradablePlans.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Upgrade your plan</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upgradablePlans.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                isCurrentPlan={p.id === plan}
                isPopular={p.id === 'pro'}
                onUpgrade={handleUpgrade}
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Buy more credits</h2>
        <CreditPurchase
          onPurchase={handleCreditPurchase}
          isLoading={purchaseLoading}
        />
      </section>

      {payments.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Payment history</h2>
          <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60 bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {payments.map((pay) => (
                  <tr key={pay.id}>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(pay.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3 capitalize">{pay.type}</td>
                    <td className="px-4 py-3 font-medium">{formatINR(pay.amount_inr)}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{pay.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
