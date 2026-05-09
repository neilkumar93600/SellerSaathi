'use client'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface CreditBadgeProps {
  credits: number
  href?: string
  className?: string
}

function toneFor(credits: number): string {
  if (credits <= 1) return 'bg-destructive/10 text-destructive border-destructive/30'
  if (credits <= 5) return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
  return 'bg-primary/10 text-primary border-primary/30'
}

export function CreditBadge({ credits, href = '/dashboard/billing', className }: CreditBadgeProps) {
  const tone = toneFor(credits)
  return (
    <Link
      href={href}
      aria-label={`${credits} credits remaining. Buy more.`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 h-8 text-sm font-medium tabular-nums transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        tone,
        className
      )}
    >
      <Zap className="h-3.5 w-3.5" aria-hidden />
      {credits}
    </Link>
  )
}
