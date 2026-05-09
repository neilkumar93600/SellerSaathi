'use client'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: { value: string; positive?: boolean }
  description?: string
  className?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className,
}: StatsCardProps) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Card
          className={cn(
            'border-border/60 bg-card/60 backdrop-blur-md transition-shadow hover:shadow-md',
            className
          )}
        >
          <CardContent className="flex items-start gap-4 p-5">
            <div
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"
              aria-hidden
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {title}
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                {value}
              </p>
              {(trend || description) && (
                <div className="mt-1 flex items-center gap-2 text-xs">
                  {trend && (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 font-medium',
                        trend.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
                      )}
                    >
                      {trend.positive ? (
                        <TrendingUp className="h-3 w-3" aria-hidden />
                      ) : (
                        <TrendingDown className="h-3 w-3" aria-hidden />
                      )}
                      {trend.value}
                    </span>
                  )}
                  {description && (
                    <span className="text-muted-foreground">{description}</span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </m.div>
    </LazyMotion>
  )
}
