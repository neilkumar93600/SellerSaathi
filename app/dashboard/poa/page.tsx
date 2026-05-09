'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { POACard } from '@/components/poa/POACard'
import { EmptyState } from '@/components/shared/EmptyState'
import { usePOAs } from '@/hooks/use-poa'

export default function POAPage() {
  const router = useRouter()
  const { poas, isLoading } = usePOAs()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Plans of Action</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-generated suspension appeal documents
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/poa/new">
            <Plus className="h-4 w-4 mr-2" />
            New POA
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : !poas?.length ? (
        <EmptyState
          title="No POAs yet"
          description="Generate your first Plan of Action to appeal a listing suspension."
          icon={FileText}
          action={{ label: 'New POA', href: '/dashboard/poa/new' }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {poas.map((poa) => (
            <POACard
              key={poa.id}
              poa={poa}
              onClick={() => router.push(`/dashboard/poa/${poa.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
