'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useListing } from '@/hooks/use-listing'
import { ListingResult } from '@/components/listings/ListingResult'
import { LoadingStream } from '@/components/shared/LoadingStream'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  params: Promise<{ id: string }>
}

export default function ListingPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const { data: listing, isLoading } = useListing(id)

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-muted-foreground">Listing not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/listings')}>
          Back to Listings
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard/listings')}
          aria-label="Back to listings"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Listing Result</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{listing.input_title}</p>
        </div>
      </div>

      {listing.status === 'processing' ? (
        <LoadingStream message="AI is still processing your listing…" lines={6} />
      ) : (
        <ListingResult listing={listing} />
      )}
    </div>
  )
}
