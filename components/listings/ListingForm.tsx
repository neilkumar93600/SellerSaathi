'use client'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { Plus, Trash2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { LanguageSelect } from '@/components/shared/LanguageSelect'
import { cn } from '@/lib/utils/cn'
import type { ListingFormData } from '@/types/listing.types'
import type { PlatformId, Category } from '@/types/database.types'

const schema = z.object({
  platform: z.enum(['amazon_india', 'flipkart']),
  category_id: z.string().min(1, 'Pick a category'),
  input_title: z.string().min(3, 'Title is required').max(500),
  input_description: z.string().min(10, 'Description must be at least 10 characters'),
  input_bullets: z
    .array(z.object({ value: z.string().min(1, 'Bullet cannot be empty') }))
    .min(1)
    .max(10),
  input_specs: z.array(
    z.object({ key: z.string().min(1), value: z.string().min(1) })
  ),
  input_keywords: z.string().optional(),
  output_language: z.string().min(2),
})

type FormValues = z.infer<typeof schema>

interface ListingFormProps {
  onSubmit: (data: ListingFormData) => void
  isLoading: boolean
  creditsRequired?: number
  categories?: Category[]
  defaultValues?: Partial<FormValues>
  className?: string
}

export function ListingForm({
  onSubmit,
  isLoading,
  creditsRequired = 1,
  categories = [],
  defaultValues,
  className,
}: ListingFormProps) {
  const t = useTranslations('listing')
  const tc = useTranslations('common')

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      platform: 'amazon_india',
      category_id: '',
      input_title: '',
      input_description: '',
      input_bullets: [{ value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }],
      input_specs: [{ key: '', value: '' }],
      input_keywords: '',
      output_language: 'en',
      ...defaultValues,
    },
  })

  const platform = form.watch('platform')
  const language = form.watch('output_language')
  const filteredCategories = categories.filter((c) => c.platform_id === platform)

  const bullets = useFieldArray({ control: form.control, name: 'input_bullets' })
  const specs = useFieldArray({ control: form.control, name: 'input_specs' })

  const submit = form.handleSubmit((values) => {
    const data: ListingFormData = {
      platform: values.platform as PlatformId,
      category_id: values.category_id,
      input_title: values.input_title,
      input_description: values.input_description,
      input_bullets: values.input_bullets.map((b) => b.value).filter(Boolean),
      input_specs: Object.fromEntries(
        values.input_specs.filter((s) => s.key && s.value).map((s) => [s.key, s.value])
      ),
      input_keywords: values.input_keywords || undefined,
      output_language: values.output_language,
    }
    onSubmit(data)
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
            <Label htmlFor="category">{t('category')}</Label>
            <Select
              value={form.watch('category_id')}
              onValueChange={(v) => form.setValue('category_id', v, { shouldValidate: true })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.length === 0 ? (
                  <SelectItem value="__none" disabled>
                    No categories available
                  </SelectItem>
                ) : (
                  filteredCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {form.formState.errors.category_id && (
              <p className="text-xs text-destructive">{form.formState.errors.category_id.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60 backdrop-blur-md">
        <CardContent className="space-y-5 p-5">
          <div className="space-y-2">
            <Label htmlFor="title">{t('productTitle')}</Label>
            <Input
              id="title"
              placeholder="e.g. Stainless Steel Water Bottle, 1L, BPA-Free"
              {...form.register('input_title')}
            />
            {form.formState.errors.input_title && (
              <p className="text-xs text-destructive">{form.formState.errors.input_title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Describe your product"
              {...form.register('input_description')}
            />
            {form.formState.errors.input_description && (
              <p className="text-xs text-destructive">
                {form.formState.errors.input_description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('bullets')}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => bullets.append({ value: '' })}
                disabled={bullets.fields.length >= 10}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {bullets.fields.map((field, i) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    placeholder={`Bullet ${i + 1}`}
                    {...form.register(`input_bullets.${i}.value`)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => bullets.remove(i)}
                    disabled={bullets.fields.length <= 1}
                    aria-label={`Remove bullet ${i + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('specs')}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => specs.append({ key: '', value: '' })}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {specs.fields.map((field, i) => (
                <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Input placeholder="Name (e.g. Material)" {...form.register(`input_specs.${i}.key`)} />
                  <Input placeholder="Value (e.g. Steel)" {...form.register(`input_specs.${i}.value`)} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => specs.remove(i)}
                    aria-label={`Remove spec ${i + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">{t('keywords')}</Label>
            <Input
              id="keywords"
              placeholder="comma, separated, keywords"
              {...form.register('input_keywords')}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60 backdrop-blur-md">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Label>{t('outputLanguage')}</Label>
            <LanguageSelect
              value={language}
              onChange={(v) => form.setValue('output_language', v)}
              ariaLabel={t('outputLanguage')}
            />
          </div>
          <Button type="submit" disabled={isLoading} size="lg" className="sm:self-end">
            <Sparkles className="mr-2 h-4 w-4" />
            {isLoading
              ? t('optimizing')
              : `${t('optimize')} (${creditsRequired} ${creditsRequired === 1 ? 'credit' : 'credits'})`}
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">{tc('save')} progress is automatic.</p>
    </form>
  )
}
