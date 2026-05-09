'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import type { POAFormData } from '@/types/poa.types'
import type { PlatformId } from '@/types/database.types'

const schema = z.object({
  platform: z.enum(['amazon_india', 'flipkart']),
  asin_or_listing_id: z.string().min(3, 'ASIN / Listing ID is required'),
  suspension_reason: z.string().min(5, 'Tell us why your listing was suspended'),
  suspension_notice_text: z.string().min(20, 'Paste the full notice'),
})

type FormValues = z.infer<typeof schema>

interface POAFormProps {
  onSubmit: (data: POAFormData) => void
  isLoading: boolean
  creditsRequired?: number
  defaultValues?: Partial<FormValues>
  className?: string
}

export function POAForm({
  onSubmit,
  isLoading,
  creditsRequired = 2,
  defaultValues,
  className,
}: POAFormProps) {
  const t = useTranslations('poa')

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      platform: 'amazon_india',
      asin_or_listing_id: '',
      suspension_reason: '',
      suspension_notice_text: '',
      ...defaultValues,
    },
  })

  const platform = form.watch('platform')

  const submit = form.handleSubmit((values) => {
    onSubmit({
      platform: values.platform as PlatformId,
      asin_or_listing_id: values.asin_or_listing_id,
      suspension_reason: values.suspension_reason,
      suspension_notice_text: values.suspension_notice_text,
    })
  })

  return (
    <form onSubmit={submit} className={cn('space-y-6', className)} noValidate>
      <Card className="border-border/60 bg-card/60 backdrop-blur-md">
        <CardContent className="grid gap-5 p-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('platform')}</Label>
            <div role="radiogroup" className="flex gap-2">
              {(['amazon_india', 'flipkart'] as const).map((p) => {
                const active = platform === p
                return (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => form.setValue('platform', p, { shouldValidate: true })}
                    className={cn(
                      'flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      active
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:border-border/80'
                    )}
                  >
                    {p === 'amazon_india' ? 'Amazon India' : 'Flipkart'}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asin">{t('asin')}</Label>
            <Input
              id="asin"
              placeholder="e.g. B0CXXXXX or FLIP-XXX"
              {...form.register('asin_or_listing_id')}
            />
            {form.formState.errors.asin_or_listing_id && (
              <p className="text-xs text-destructive">
                {form.formState.errors.asin_or_listing_id.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60 backdrop-blur-md">
        <CardContent className="space-y-5 p-5">
          <div className="space-y-2">
            <Label htmlFor="reason">{t('reason')}</Label>
            <Textarea
              id="reason"
              rows={3}
              placeholder="In your own words, what triggered the suspension?"
              {...form.register('suspension_reason')}
            />
            {form.formState.errors.suspension_reason && (
              <p className="text-xs text-destructive">
                {form.formState.errors.suspension_reason.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notice">{t('notice')}</Label>
            <Textarea
              id="notice"
              rows={10}
              placeholder="Paste the full suspension notice text exactly as received…"
              className="font-mono text-xs"
              {...form.register('suspension_notice_text')}
            />
            {form.formState.errors.suspension_notice_text && (
              <p className="text-xs text-destructive">
                {form.formState.errors.suspension_notice_text.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} size="lg">
          <Sparkles className="mr-2 h-4 w-4" />
          {isLoading
            ? t('generating')
            : `${t('generate')} (${creditsRequired} ${creditsRequired === 1 ? 'credit' : 'credits'})`}
        </Button>
      </div>
    </form>
  )
}
