'use client'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PlatformBadge } from '@/components/shared/PlatformBadge'
import { formatRelativeTime } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import type { Listing, ListingStatus } from '@/types/database.types'

interface ListingCardProps {
  listing: Listing
  onClick?: () => void
  className?: string
}

const STATUS_TONE: Record<ListingStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  processing: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  completed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  failed: 'bg-destructive/10 text-destructive',
}

export function ListingCard({ listing, onClick, className }: ListingCardProps) {
  const before = listing.seo_score_before ?? 0
  const after = listing.seo_score_after ?? 0
  const delta = after - before

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
        aria-label={`Open listing ${listing.input_title ?? ''}`}
      >
        <Card className="border-border/60 bg-card/60 backdrop-blur-md transition-colors hover:border-primary/40">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between gap-2">
              <PlatformBadge platform={listing.platform_id} />
              <Badge variant="outline" className={cn('capitalize border-transparent', STATUS_TONE[listing.status])}>
                {listing.status}
              </Badge>
            </div>
            <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
              {listing.input_title ?? 'Untitled listing'}
            </h3>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 tabular-nums text-muted-foreground">
                <span>SEO</span>
                <span>{before}</span>
                <ArrowRight className="h-3 w-3" aria-hidden />
                <span className="font-semibold text-foreground">{after}</span>
                {delta !== 0 && (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                      delta > 0 ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-destructive/10 text-destructive'
                    )}
                  >
                    {delta > 0 ? '+' : ''}
                    {delta}
                  </span>
                )}
              </div>
              <span className="text-muted-foreground">{formatRelativeTime(listing.created_at)}</span>
            </div>
          </CardContent>
        </Card>
      </m.button>
    </LazyMotion>
  )
}
