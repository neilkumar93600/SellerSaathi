'use client'
import Link from 'next/link'
import { ListChecks, FileText, type LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatRelativeTime } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

export interface ActivityItem {
  id: string
  type: 'listing' | 'poa'
  title: string
  date: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  href?: string
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  title?: string
  emptyHref?: string
  className?: string
}

const ICONS: Record<ActivityItem['type'], LucideIcon> = {
  listing: ListChecks,
  poa: FileText,
}

const STATUS_TONE: Record<ActivityItem['status'], string> = {
  pending: 'bg-muted text-muted-foreground',
  processing: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  completed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  failed: 'bg-destructive/10 text-destructive',
}

export function ActivityFeed({ activities, title = 'Recent activity', emptyHref, className }: ActivityFeedProps) {
  return (
    <Card className={cn('border-border/60 bg-card/60 backdrop-blur-md', className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Your recent listings and POAs will appear here."
            action={emptyHref ? { label: 'Get started', href: emptyHref } : undefined}
          />
        ) : (
          <ol className="relative space-y-4 border-l border-border/60 pl-5">
            {activities.map((item) => {
              const Icon = ICONS[item.type]
              const inner = (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(item.date)}
                    </p>
                  </div>
                  <Badge variant="outline" className={cn('shrink-0 capitalize border-transparent', STATUS_TONE[item.status])}>
                    {item.status}
                  </Badge>
                </div>
              )
              return (
                <li key={item.id} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[1.6rem] top-1.5 grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary ring-4 ring-background"
                  >
                    <Icon className="h-3 w-3" />
                  </span>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="block -mx-2 rounded-lg p-2 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div className="block -mx-2 rounded-lg p-2">{inner}</div>
                  )}
                </li>
              )
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
