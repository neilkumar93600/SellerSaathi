'use client'
import { useState } from 'react'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { Zap, Sparkle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatINR } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import type { CreditPack } from '@/types/payment.types'

interface CreditPurchaseProps {
  onPurchase: (credits: number, priceInr: number) => void
  isLoading?: boolean
  packs?: CreditPack[]
  pricePerCreditInr?: number
  className?: string
}

const DEFAULT_PACKS: CreditPack[] = [
  { credits: 5, price_inr: 245 },
  { credits: 10, price_inr: 449 },
  { credits: 25, price_inr: 999 },
]

export function CreditPurchase({
  onPurchase,
  isLoading,
  packs = DEFAULT_PACKS,
  pricePerCreditInr = 49,
  className,
}: CreditPurchaseProps) {
  const [selected, setSelected] = useState<number>(packs[1]?.credits ?? packs[0]?.credits ?? 0)
  const bestValue = packs.reduce(
    (best, p) => (p.price_inr / p.credits < best.price_inr / best.credits ? p : best),
    packs[0]
  )

  const selectedPack = packs.find((p) => p.credits === selected) ?? packs[0]

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid gap-3 sm:grid-cols-3">
        <LazyMotion features={domAnimation}>
          {packs.map((pack) => {
            const active = pack.credits === selected
            const isBest = pack.credits === bestValue.credits
            const perCredit = pack.price_inr / pack.credits
            const baselineSavings = Math.max(0, pricePerCreditInr - perCredit)
            return (
              <m.button
                key={pack.credits}
                type="button"
                onClick={() => setSelected(pack.credits)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                aria-pressed={active}
                className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
              >
                <Card
                  className={cn(
                    'relative h-full border-border/60 bg-card/60 backdrop-blur-md transition-colors',
                    active && 'border-primary/60 ring-1 ring-primary/30'
                  )}
                >
                  {isBest && (
                    <Badge className="absolute -top-2 right-4 bg-primary text-primary-foreground">
                      <Sparkle className="mr-1 h-3 w-3" /> Best value
                    </Badge>
                  )}
                  <CardContent className="space-y-2 p-5">
                    <div className="flex items-center gap-2 text-primary">
                      <Zap className="h-4 w-4" aria-hidden />
                      <span className="text-sm font-medium">{pack.credits} credits</span>
                    </div>
                    <p className="text-2xl font-semibold tabular-nums text-foreground">
                      {formatINR(pack.price_inr)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatINR(Math.round(perCredit))} / credit
                      {baselineSavings > 0 && (
                        <span className="ml-1 text-emerald-600 dark:text-emerald-400">
                          · save {Math.round((baselineSavings / pricePerCreditInr) * 100)}%
                        </span>
                      )}
                    </p>
                  </CardContent>
                </Card>
              </m.button>
            )
          })}
        </LazyMotion>
      </div>

      <Button
        type="button"
        size="lg"
        className="w-full sm:w-auto"
        disabled={isLoading || !selectedPack}
        onClick={() => selectedPack && onPurchase(selectedPack.credits, selectedPack.price_inr)}
      >
        {isLoading
          ? 'Processing…'
          : `Buy ${selectedPack?.credits ?? 0} credits — ${formatINR(selectedPack?.price_inr ?? 0)}`}
      </Button>
    </div>
  )
}
