'use client'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { Check, Sparkle } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatINR } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import type { Plan, PlanId } from '@/types/database.types'

interface PlanCardProps {
  plan: Plan
  isCurrentPlan: boolean
  isPopular?: boolean
  isLoading?: boolean
  onUpgrade: (planId: PlanId) => void
  className?: string
}

function featureLabels(plan: Plan): string[] {
  const f = plan.features
  const list: string[] = []
  list.push(`${plan.credits_per_month} credits / month`)
  if (f.listing_optimizer) list.push('Listing optimizer')
  if (f.poa_generator) list.push('POA generator')
  if (f.platforms?.length) list.push(`${f.platforms.length} platform${f.platforms.length === 1 ? '' : 's'}`)
  if (f.languages?.length) list.push(`${f.languages.length} languages`)
  if (f.pdf_export) list.push('PDF export')
  if (f.seo_score) list.push('SEO score')
  if (f.bulk_upload) list.push('Bulk upload')
  if (f.team_seats) list.push(`${f.team_seats} team seats`)
  list.push(`${f.support} support`)
  return list
}

export function PlanCard({
  plan,
  isCurrentPlan,
  isPopular,
  isLoading,
  onUpgrade,
  className,
}: PlanCardProps) {
  const features = featureLabels(plan)
  const isFree = plan.monthly_price_inr === 0

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className={cn('h-full', className)}
      >
        <Card
          className={cn(
            'relative h-full border-border/60 bg-card/60 backdrop-blur-md transition-colors',
            isCurrentPlan && 'border-primary/60 ring-1 ring-primary/30',
            isPopular && !isCurrentPlan && 'border-primary/40'
          )}
        >
          {isPopular && (
            <Badge className="absolute -top-2 right-5 bg-primary text-primary-foreground">
              <Sparkle className="mr-1 h-3 w-3" /> Most popular
            </Badge>
          )}
          <CardHeader className="space-y-1.5">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {plan.display_name}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold tabular-nums text-foreground">
                {isFree ? 'Free' : formatINR(plan.monthly_price_inr)}
              </span>
              {!isFree && <span className="text-sm text-muted-foreground">/ month</span>}
            </div>
          </CardHeader>
          <CardContent className="flex h-full flex-col gap-5">
            <ul className="space-y-2 text-sm">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              className="mt-auto"
              variant={isCurrentPlan ? 'outline' : 'default'}
              disabled={isCurrentPlan || isLoading}
              onClick={() => onUpgrade(plan.id)}
            >
              {isCurrentPlan ? 'Current plan' : isFree ? 'Get started' : 'Upgrade'}
            </Button>
          </CardContent>
        </Card>
      </m.div>
    </LazyMotion>
  )
}
