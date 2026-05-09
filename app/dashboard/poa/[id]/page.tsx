'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { POAResult } from '@/components/poa/POAResult'
import { LoadingStream } from '@/components/shared/LoadingStream'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default function POADetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()

  const { data: poa, isLoading } = useQuery({
    queryKey: ['poa', id],
    queryFn: async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('poa_requests')
        .select('*')
        .eq('id', id)
        .single()
      return data
    },
    enabled: !!id,
    refetchInterval: (query) =>
      query.state.data?.status === 'processing' ? 3000 : false,
  })

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  if (!poa) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-muted-foreground">POA not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/poa')}>
          Back to POAs
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
          onClick={() => router.push('/dashboard/poa')}
          aria-label="Back to POAs"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Plan of Action</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {poa.asin_or_listing_id ?? 'POA request'}
          </p>
        </div>
      </div>

      {poa.status === 'processing' ? (
        <LoadingStream message="AI is still generating your POA…" lines={8} />
      ) : (
        <POAResult poa={poa} />
      )}
    </div>
  )
}
