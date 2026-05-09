import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface LogoProps {
  href?: string
  className?: string
  showWordmark?: boolean
}

export function Logo({ href = '/', className, showWordmark = true }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md',
        className
      )}
      aria-label="SellerSaathi"
    >
      <span
        aria-hidden
        className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-semibold shadow-sm"
        style={{ fontFamily: 'var(--font-heading, inherit)' }}
      >
        S
      </span>
      {showWordmark && (
        <span
          className="text-base font-semibold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-heading, inherit)' }}
        >
          SellerSaathi
        </span>
      )}
    </Link>
  )
}
