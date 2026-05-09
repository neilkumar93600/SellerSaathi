'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  ListChecks,
  FileText,
  CreditCard,
  Settings,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils/cn'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  collapsed?: boolean
}

interface NavItem {
  href: string
  labelKey: 'dashboard' | 'listings' | 'poa' | 'billing' | 'settings'
  icon: LucideIcon
}

const NAV: NavItem[] = [
  { href: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/dashboard/listings', labelKey: 'listings', icon: ListChecks },
  { href: '/dashboard/poa', labelKey: 'poa', icon: FileText },
  { href: '/dashboard/billing', labelKey: 'billing', icon: CreditCard },
  { href: '/dashboard/settings', labelKey: 'settings', icon: Settings },
]

export function Sidebar({ isOpen, onToggle, collapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const t = useTranslations('nav')

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-foreground/30 backdrop-blur-sm md:hidden"
          onClick={onToggle}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border/60 bg-background/80 backdrop-blur-xl transition-[transform,width] duration-200 md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:translate-x-0',
          collapsed ? 'w-16' : 'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Primary navigation"
      >
        <div className="flex h-14 items-center justify-between px-3 md:hidden">
          <span className="text-sm font-semibold">Menu</span>
          <Button variant="ghost" size="icon" onClick={onToggle} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <nav className="space-y-1 p-2">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
                  {active && !collapsed && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                  )}
                </Link>
              )
            })}
          </nav>
        </ScrollArea>
      </aside>
    </>
  )
}
