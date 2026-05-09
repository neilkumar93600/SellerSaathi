'use client'
import { AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PlanCard } from './PlanCard'
import type { Plan, PlanId } from '@/types/database.types'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  plans: Plan[]
  currentPlan: PlanId
  onUpgrade: (planId: PlanId) => void
  isLoading?: boolean
  reason?: string
}

export function UpgradeModal({
  isOpen,
  onClose,
  plans,
  currentPlan,
  onUpgrade,
  isLoading,
  reason,
}: UpgradeModalProps) {
  const upgradablePlans = plans.filter((p) => p.id !== 'free' && p.id !== currentPlan)

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Upgrade your plan</DialogTitle>
          <DialogDescription>
            Choose a plan that grows with your store.
          </DialogDescription>
        </DialogHeader>

        {reason && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>{reason}</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upgradablePlans.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              isCurrentPlan={false}
              isPopular={p.id === 'pro'}
              isLoading={isLoading}
              onUpgrade={onUpgrade}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
