import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-border/60 bg-background/40">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-8 text-sm md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-xs text-muted-foreground">
            © {year} SellerSaathi. Built for Indian sellers.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground">
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  )
}
