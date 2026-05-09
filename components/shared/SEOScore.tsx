'use client'
import { useId } from 'react'
import { cn } from '@/lib/utils/cn'

interface SEOScoreProps {
  score: number
  label?: string
  size?: number
  className?: string
}

function colorFor(score: number): string {
  if (score <= 40) return 'var(--color-destructive, #ef4444)'
  if (score <= 70) return 'oklch(0.78 0.16 75)'
  return 'oklch(0.7 0.18 150)'
}

export function SEOScore({ score, label, size = 72, className }: SEOScoreProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)))
  const id = useId()
  const stroke = 6
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference
  const color = colorFor(clamped)

  return (
    <div className={cn('inline-flex flex-col items-center gap-1.5', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--color-muted)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            id={id}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            fill="none"
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div
          className="absolute inset-0 grid place-items-center text-sm font-semibold tabular-nums text-foreground"
          aria-label={`SEO score ${clamped} of 100`}
        >
          {clamped}
        </div>
      </div>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  )
}
