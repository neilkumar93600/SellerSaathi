import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'

const NAV_GROUPS = [
  {
    title: 'Product',
    links: [
      { href: '#features', label: 'Features' },
      { href: '#pricing', label: 'Pricing' },
      { href: '/blog', label: 'Blog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/help', label: 'Help center' },
      { href: '/changelog', label: 'Changelog' },
      { href: '/status', label: 'Status' },
    ],
  },
]

export function MarketingFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="relative border-t border-border/60 bg-background/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-8">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            AI listing & POA tools built for Indian Amazon and Flipkart sellers.
          </p>
        </div>
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
              {group.title}
            </p>
            <ul className="space-y-2">
              {group.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <p>© {year} SellerSaathi. Made with care in India.</p>
          <p className="opacity-70">Powered by Supabase · Vercel · Razorpay</p>
        </div>
      </div>
    </footer>
  )
}
