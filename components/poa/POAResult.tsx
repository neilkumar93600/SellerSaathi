'use client'
import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Copy, Check, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { LoadingStream } from '@/components/shared/LoadingStream'
import { cn } from '@/lib/utils/cn'
import type { PoaRequest } from '@/types/database.types'

interface POAResultProps {
  poa: PoaRequest
  isStreaming?: boolean
  streamContent?: string
  onDownloadPDF?: () => void
  className?: string
}

interface Section {
  key: string
  label: string
  content: string
}

function parseSections(text: string): { subject: string; sections: Section[] } {
  if (!text) return { subject: '', sections: [] }
  const subjectMatch = text.match(/^subject(?: line)?:\s*(.+)$/im)
  const subject = subjectMatch?.[1]?.trim() ?? ''

  const headers = [
    { key: 'summary', label: 'Summary' },
    { key: 'rootCause', label: 'Root cause analysis' },
    { key: 'corrective', label: 'Corrective actions' },
    { key: 'preventive', label: 'Preventive actions' },
  ]
  const sections: Section[] = []
  for (const h of headers) {
    const re = new RegExp(`(?:^|\\n)\\s*(?:#+\\s*)?${h.label}\\b[:\\s-]*([\\s\\S]*?)(?=\\n\\s*(?:#+\\s*)?(?:summary|root cause|corrective|preventive)\\b|$)`, 'i')
    const m = text.match(re)
    if (m?.[1]) sections.push({ key: h.key, label: h.label, content: m[1].trim() })
  }
  if (sections.length === 0) {
    sections.push({ key: 'full', label: 'Plan of Action', content: text.trim() })
  }
  return { subject, sections }
}

function CopyButton({ text }: { text: string }) {
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

export function POAResult({
  poa,
  isStreaming,
  streamContent,
  onDownloadPDF,
  className,
}: POAResultProps) {
  const t = useTranslations('poa')
  const tc = useTranslations('common')
  const fullText = isStreaming ? streamContent ?? '' : poa.generated_poa ?? ''
  const { subject, sections } = useMemo(() => parseSections(fullText), [fullText])

  if (isStreaming && !fullText) {
    return (
      <Card className={cn('border-border/60 bg-card/60 backdrop-blur-md', className)}>
        <CardContent className="p-5">
          <LoadingStream message="Generating your Plan of Action…" lines={8} />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {subject && (
        <Card className="border-border/60 bg-card/60 backdrop-blur-md">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Email subject
            </CardTitle>
            <CopyButton text={subject} />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-base font-semibold text-foreground">{subject}</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60 bg-card/60 backdrop-blur-md">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-semibold">{t('title')}</CardTitle>
          <div className="flex gap-2">
            <CopyButton text={fullText} />
            {onDownloadPDF && (
              <Button variant="outline" size="sm" onClick={onDownloadPDF}>
                <Download className="mr-1.5 h-3.5 w-3.5" /> {tc('download')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isStreaming && (
            <p className="mb-3 text-xs text-muted-foreground">Streaming…</p>
          )}
          <Accordion type="multiple" defaultValue={sections.map((s) => s.key)}>
            {sections.map((s) => (
              <AccordionItem key={s.key} value={s.key} className="border-border/60">
                <AccordionTrigger className="text-sm font-medium">{s.label}</AccordionTrigger>
                <AccordionContent>
                  <div className="flex items-start justify-between gap-2">
                    <p className="whitespace-pre-wrap text-sm text-foreground">{s.content}</p>
                    <CopyButton text={s.content} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
