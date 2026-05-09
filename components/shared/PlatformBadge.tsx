import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { PlatformId } from '@/types/database.types'

interface PlatformBadgeProps {
  platform: PlatformId
  className?: string
}

const META: Record<PlatformId, { label: string; tone: string }> = {
  amazon_india: {
    label: 'Amazon India',
    tone: 'bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-300',
  },
  flipkart: {
    label: 'Flipkart',
    tone: 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-300',
  },
}

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  const meta = META[platform]
  return (
    <Badge variant="outline" className={cn('gap-1.5 font-medium', meta.tone, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {meta.label}
    </Badge>
  )
}
