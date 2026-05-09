'use client'

import type { Metadata } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, ListChecks } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ListingCard } from '@/components/listings/ListingCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { useListings } from '@/hooks/use-listing'

export default function ListingsPage() {
  const router = useRouter()
  const { listings, isLoading } = useListings()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Listings</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-optimized product listings</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/listings/new">
            <Plus className="h-4 w-4 mr-2" />
            New Listing
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : !listings?.length ? (
        <EmptyState
          title="No listings yet"
          description="Create your first AI-optimized listing to get started."
          icon={ListChecks}
          action={{ label: 'New Listing', href: '/dashboard/listings/new' }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onClick={() => router.push(`/dashboard/listings/${listing.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
