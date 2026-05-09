'use client'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils/cn'

interface LoadingStreamProps {
  message?: string
  lines?: number
  className?: string
}

export function LoadingStream({ message, lines = 4, className }: LoadingStreamProps) {
  return (
    <div className={cn('space-y-3', className)} role="status" aria-live="polite">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        <span>{message ?? 'AI is generating…'}</span>
        <span className="sr-only">Loading</span>
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-3"
            style={{ width: `${85 - i * 10}%` }}
          />
        ))}
      </div>
    </div>
  )
}
