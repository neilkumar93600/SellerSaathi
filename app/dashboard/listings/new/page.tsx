'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ListingForm } from '@/components/listings/ListingForm'
import { LoadingStream } from '@/components/shared/LoadingStream'
import { UpgradeModal } from '@/components/billing/UpgradeModal'
import { useCredits } from '@/hooks/use-credits'
import type { ListingFormData } from '@/types/listing.types'
import type { Category, Plan } from '@/types/database.types'

export default function NewListingPage() {
  const router = useRouter()
  const { plan } = useCredits()
  const [categories, setCategories] = useState<Category[]>([])
  const [streaming, setStreaming] = useState(false)
  const [streamContent, setStreamContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('categories')
      .select('*')
      .order('name')
      .then(({ data }) => setCategories(data ?? []))

    supabase
      .from('plans')
      .select('*')
      .then(({ data }) => setPlans(data ?? []))
  }, [])

  async function handleSubmit(formData: ListingFormData) {
    setError(null)
    setStreamContent('')
    setStreaming(true)

    try {
      const res = await fetch('/api/ai/optimize-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const body = await res.json()
        if (body.error === 'insufficient_credits') {
          setShowUpgrade(true)
          setStreaming(false)
          return
        }
        throw new Error(body.error ?? 'Optimization failed')
      }

      const listingId = res.headers.get('X-Listing-Id')
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        let idx: number
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const chunk = buffer.slice(0, idx)
          buffer = buffer.slice(idx + 2)

          if (chunk.startsWith('event: ')) {
            const lines = chunk.split('\n')
            const eventType = lines[0].slice(7)
            const dataLine = lines.find((l) => l.startsWith('data: '))
            if (!dataLine) continue
            const data = JSON.parse(dataLine.slice(6))

            if (eventType === 'meta' && data.status === 'completed') {
              router.push(`/dashboard/listings/${data.listing_id ?? listingId}`)
              return
            }
            if (eventType === 'error') {
              throw new Error(data.error ?? 'Generation failed')
            }
          } else if (chunk.startsWith('data: ')) {
            const raw = chunk.slice(6)
            if (raw === '[DONE]') continue
            try {
              const data = JSON.parse(raw)
              if (data.content) setStreamContent((prev) => prev + data.content)
            } catch {}
          }
        }
      }

      if (listingId) router.push(`/dashboard/listings/${listingId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStreaming(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Listing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in your product details — AI will optimize the listing for you.
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      {streaming ? (
        <LoadingStream message="AI is optimizing your listing…" lines={6} />
      ) : (
        <ListingForm
          onSubmit={handleSubmit}
          isLoading={streaming}
          categories={categories}
          creditsRequired={1}
        />
      )}

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        plans={plans}
        currentPlan={plan as Parameters<typeof UpgradeModal>[0]['currentPlan']}
        onUpgrade={() => router.push('/dashboard/billing')}
        reason="You need more credits to optimize listings."
      />
    </div>
  )
}
