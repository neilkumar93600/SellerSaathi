'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface CreditMeterProps {
  used: number
  total: number
  plan: string
  className?: string
}

export function CreditMeter({ used, total, plan, className }: CreditMeterProps) {
  const t = useTranslations('billing')
  const safeTotal = Math.max(total, 1)
  const pct = Math.min(100, Math.round((used / safeTotal) * 100))
  const remaining = Math.max(total - used, 0)
  const showBuy = pct >= 80
  const showUpgrade = plan === 'free'

  return (
    <Card className={cn('border-border/60 bg-card/60 backdrop-blur-md', className)}>
      <CardContent className="p-5">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('credits')}
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
              {remaining}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                / {total}
              </span>
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium capitalize text-primary">
            {plan}
          </span>
        </div>
        <Progress value={pct} className="mt-3 h-2" />
        <p className="mt-2 text-xs text-muted-foreground">
          {used} of {total} credits used this period
        </p>
        {(showBuy || showUpgrade) && (
          <div className="mt-3 flex gap-2">
            {showBuy && (
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/billing">{t('buyCredits')}</Link>
              </Button>
            )}
            {showUpgrade && (
              <Button asChild size="sm">
                <Link href="/dashboard/billing">{t('upgrade')}</Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
