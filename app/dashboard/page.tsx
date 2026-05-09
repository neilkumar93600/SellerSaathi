'use client'

import { useAuth } from '@/hooks/use-auth'
import { useCredits } from '@/hooks/use-credits'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { CreditMeter } from '@/components/dashboard/CreditMeter'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { Skeleton } from '@/components/ui/skeleton'
import { ListChecks, FileText, Coins, BadgeCheck } from 'lucide-react'
import { useListings } from '@/hooks/use-listing'
import { usePOAs } from '@/hooks/use-poa'
import type { ActivityItem } from '@/components/dashboard/ActivityFeed'

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const { credits, plan } = useCredits()
  const { listings, isLoading: listingsLoading } = useListings()
  const { poas, isLoading: poasLoading } = usePOAs()

  if (!user) return null

  const creditsTotal =
    plan === 'agency' ? 500 : plan === 'pro' ? 150 : plan === 'growth' ? 50 : 10
  const creditsUsed = creditsTotal - credits

  const activities: ActivityItem[] = [
    ...(listings ?? []).slice(0, 5).map((l) => ({
      id: l.id,
      type: 'listing' as const,
      title: l.input_title ?? 'Untitled listing',
      date: l.created_at,
      status: l.status,
      href: `/dashboard/listings/${l.id}`,
    })),
    ...(poas ?? []).slice(0, 5).map((p) => ({
      id: p.id,
      type: 'poa' as const,
      title: p.asin_or_listing_id ?? 'POA request',
      date: p.created_at,
      status: p.status,
      href: `/dashboard/poa/${p.id}`,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const isLoading = listingsLoading || poasLoading

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, {profile?.full_name ?? user.email}
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Credits remaining"
            value={credits}
            icon={Coins}
            description={`${plan.toUpperCase()} plan`}
          />
          <StatsCard
            title="Listings created"
            value={listings?.length ?? 0}
            icon={ListChecks}
          />
          <StatsCard
            title="POAs generated"
            value={poas?.length ?? 0}
            icon={FileText}
          />
          <StatsCard
            title="Plan"
            value={plan.charAt(0).toUpperCase() + plan.slice(1)}
            icon={BadgeCheck}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <CreditMeter
          used={creditsUsed}
          total={creditsTotal}
          plan={plan}
          className="lg:col-span-1"
        />
        <QuickActions className="lg:col-span-2" />
      </div>

      <ActivityFeed
        activities={activities}
        emptyHref="/dashboard/listings/new"
      />
    </div>
  )
}
