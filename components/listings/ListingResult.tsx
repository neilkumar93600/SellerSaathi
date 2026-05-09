'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Copy, Check, Download, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { SEOScore } from '@/components/shared/SEOScore'
import { LoadingStream } from '@/components/shared/LoadingStream'
import { cn } from '@/lib/utils/cn'
import type { Listing } from '@/types/database.types'

interface ListingResultProps {
  listing: Listing
  isStreaming?: boolean
  streamContent?: string
  onDownloadPDF?: () => void
  className?: string
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const t = useTranslations('common')
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      aria-label={label ?? t('copy')}
    >
      {copied ? (
        <>
          <Check className="mr-1.5 h-3.5 w-3.5" /> {t('copied')}
        </>
      ) : (
        <>
          <Copy className="mr-1.5 h-3.5 w-3.5" /> {t('copy')}
        </>
      )}
    </Button>
  )
}

function Comparison({ before, after }: { before: string; after: string }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-xl border border-border bg-muted/30 p-3">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Before
        </p>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{before || '—'}</p>
      </div>
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">After</p>
          <CopyButton text={after} />
        </div>
        <p className="whitespace-pre-wrap text-sm text-foreground">{after || '—'}</p>
      </div>
    </div>
  )
}

export function ListingResult({
  listing,
  isStreaming,
  streamContent,
  onDownloadPDF,
  className,
}: ListingResultProps) {
  const t = useTranslations('listing')

  if (isStreaming) {
    return (
      <Card className={cn('border-border/60 bg-card/60 backdrop-blur-md', className)}>
        <CardContent className="space-y-4 p-5">
          <LoadingStream message="AI is optimizing your listing…" lines={6} />
          {streamContent && (
            <pre className="max-h-72 overflow-auto rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              {streamContent}
            </pre>
          )}
        </CardContent>
      </Card>
    )
  }

  const bulletsBefore = listing.input_bullets ?? []
  const bulletsAfter = listing.optimized_bullets ?? []

  return (
    <div className={cn('space-y-4', className)}>
      <Card className="border-border/60 bg-card/60 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold">{t('seoScore')}</CardTitle>
          {onDownloadPDF && (
            <Button variant="outline" size="sm" onClick={onDownloadPDF}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> {t('downloadPDF')}
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex items-center justify-around gap-6 p-5">
          <SEOScore score={listing.seo_score_before ?? 0} label={t('before')} />
          <div className="text-2xl text-muted-foreground" aria-hidden>
            →
          </div>
          <SEOScore score={listing.seo_score_after ?? 0} label={t('after')} />
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60 backdrop-blur-md">
        <CardContent className="p-2 sm:p-4">
          <Tabs defaultValue="title">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="title">Title</TabsTrigger>
              <TabsTrigger value="bullets">Bullets</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
            </TabsList>

            <TabsContent value="title" className="mt-4">
              <Comparison before={listing.input_title ?? ''} after={listing.optimized_title ?? ''} />
            </TabsContent>

            <TabsContent value="bullets" className="mt-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Before
                  </p>
                  <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                    {bulletsBefore.length ? bulletsBefore.map((b, i) => <li key={i}>{b}</li>) : <li>—</li>}
                  </ul>
                </div>
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wide text-primary">After</p>
                    <CopyButton text={bulletsAfter.join('\n')} />
                  </div>
                  <ul className="list-disc space-y-1 pl-4 text-sm text-foreground">
                    {bulletsAfter.length ? bulletsAfter.map((b, i) => <li key={i}>{b}</li>) : <li>—</li>}
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="description" className="mt-4">
              <Comparison
                before={listing.input_description ?? ''}
                after={listing.optimized_description ?? ''}
              />
            </TabsContent>

            <TabsContent value="keywords" className="mt-4">
              <Comparison
                before={listing.input_keywords ?? ''}
                after={listing.optimized_backend_keywords ?? ''}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible>
        <AccordionItem value="improvements" className="border-border/60">
          <AccordionTrigger className="text-sm font-medium">
            <span className="flex items-center gap-2">
              <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />
              Why these changes?
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">
              The AI rewrote sections to improve discoverability, scannability, and platform compliance.
              Toggle tabs above to compare each section side-by-side.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
