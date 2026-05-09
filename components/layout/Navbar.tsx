'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Menu, LogOut, Settings, CreditCard, User as UserIcon } from 'lucide-react'
import type { Profile } from '@/types/database.types'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Logo } from '@/components/shared/Logo'
import { CreditBadge } from '@/components/shared/CreditBadge'
import { LanguageSelect } from '@/components/shared/LanguageSelect'

interface NavbarProps {
  user?: User | null
  profile?: Profile | null
  onSignOut: () => void
  onMenuToggle?: () => void
  onLanguageChange?: (lang: string) => void
}

export function Navbar({
  user,
  profile,
  onSignOut,
  onMenuToggle,
  onLanguageChange,
}: NavbarProps) {
  const t = useTranslations('nav')
  const initials =
    profile?.full_name
      ?.split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 items-center gap-3 px-4 md:px-6">
        {onMenuToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <Logo />

        <div className="ml-auto flex items-center gap-2">
          <LanguageSelect
            value={profile?.language_preference ?? 'en'}
            onChange={(lang) => onLanguageChange?.(lang)}
            className="hidden sm:flex"
            ariaLabel="Interface language"
          />
          <CreditBadge credits={profile?.credits_remaining ?? 0} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full focus-visible:ring-2"
                aria-label="Account menu"
              >
                <Avatar className="h-8 w-8">
                  {profile?.avatar_url && (
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? ''} />
                  )}
                  <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium leading-none">
                    {profile?.full_name ?? user?.email}
                  </p>
                  {profile?.email && (
                    <p className="text-xs leading-none text-muted-foreground">{profile.email}</p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <UserIcon className="mr-2 h-4 w-4" />
                  {t('settings')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/billing">
                  <CreditCard className="mr-2 h-4 w-4" />
                  {t('billing')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  {t('settings')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
