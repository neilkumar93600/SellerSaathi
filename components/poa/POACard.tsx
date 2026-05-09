'use client'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PlatformBadge } from '@/components/shared/PlatformBadge'
import { formatRelativeTime } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import type { PoaRequest, PoaStatus } from '@/types/database.types'

interface POACardProps {
  poa: PoaRequest
  onClick?: () => void
  className?: string
}

const STATUS_TONE: Record<PoaStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  processing: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  completed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  failed: 'bg-destructive/10 text-destructive',
}

export function POACard({ poa, onClick, className }: POACardProps) {
  return (
    <LazyMotion features={domAnimation}>
      <m.button
        type="button"
        onClick={onClick}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={cn(
          'group block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl',
          className
        )}
        aria-label={`Open POA ${poa.asin_or_listing_id ?? ''}`}
      >
        <Card className="border-border/60 bg-card/60 backdrop-blur-md transition-colors hover:border-primary/40">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between gap-2">
              <PlatformBadge platform={poa.platform_id} />
              <Badge variant="outline" className={cn('capitalize border-transparent', STATUS_TONE[poa.status])}>
                {poa.status}
              </Badge>
            </div>
            <div className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {poa.asin_or_listing_id ?? 'Unknown listing'}
                </p>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {poa.suspension_reason ?? 'No reason provided.'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>v{poa.poa_version}</span>
              <span>{formatRelativeTime(poa.created_at)}</span>
            </div>
          </CardContent>
        </Card>
      </m.button>
    </LazyMotion>
  )
}
