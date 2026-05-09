'use client'
import Link from 'next/link'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { ListChecks, FileText, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

interface QuickActionsProps {
  className?: string
}

export function QuickActions({ className }: QuickActionsProps) {
  const t = useTranslations('dashboard')

  const actions = [
    {
      href: '/dashboard/listings/new',
      title: t('newListing'),
      description: 'Optimize a product listing with AI',
      icon: ListChecks,
      cost: '1 credit',
    },
    {
      href: '/dashboard/poa/new',
      title: t('newPOA'),
      description: 'Generate a Plan of Action draft',
      icon: FileText,
      cost: '2 credits',
    },
  ]

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2', className)}>
      <LazyMotion features={domAnimation}>
        {actions.map((a) => {
          const Icon = a.icon
          return (
            <m.div
              key={a.href}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Link
                href={a.href}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
              >
                <Card className="group border-border/60 bg-card/60 backdrop-blur-md transition-colors hover:border-primary/50">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">{a.title}</p>
                        <ArrowRight
                          className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.description}</p>
                      <p className="mt-2 text-xs font-medium text-primary">{a.cost}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </m.div>
          )
        })}
      </LazyMotion>
    </div>
  )
}
