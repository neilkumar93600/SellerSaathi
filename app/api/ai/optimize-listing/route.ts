import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  buildListingUserPrompt,
  getListingSystemPrompt,
} from '@/lib/ai/prompts/listing.prompts'
import { parseAIJson, streamAIResponse } from '@/lib/ai/utils'

const OptimizeListingSchema = z.object({
  platform: z.enum(['amazon_india', 'flipkart']),
  category_id: z.string().min(1),
  category_name: z.string().optional(),
  input_title: z.string().min(1),
  input_description: z.string(),
  input_bullets: z.array(z.string()),
  input_specs: z.record(z.string(), z.string()),
  input_keywords: z.string().optional(),
  output_language: z.enum(['en', 'hi', 'bn', 'ta', 'te', 'kn', 'mr', 'gu']),
})

type OptimizedListing = {
  optimized_title: string
  optimized_bullets: string[]
  optimized_description: string
  backend_keywords: string
  seo_score: number
  improvements: string[]
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = OptimizeListingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { data: creditResult, error: creditError } = await supabase.rpc(
      'get_credits_and_deduct',
      { p_user_id: user.id, p_amount: 1 },
    )

    if (creditError) {
      console.error('[optimize-listing] credit rpc error', creditError)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    if (!creditResult?.success) {
      return NextResponse.json(
        {
          error: 'insufficient_credits',
          code: 'CREDITS_DEPLETED',
          credits_remaining: creditResult?.credits_remaining ?? 0,
        },
        { status: 400 },
      )
    }

    const { data: listing, error: insertError } = await supabase
      .from('listings')
      .insert({
        user_id: user.id,
        platform_id: parsed.data.platform,
        category_id: parsed.data.category_id,
        input_title: parsed.data.input_title,
        input_description: parsed.data.input_description,
        input_bullets: parsed.data.input_bullets,
        input_specs: parsed.data.input_specs,
        input_keywords: parsed.data.input_keywords ?? null,
        output_language: parsed.data.output_language,
        status: 'processing',
        credits_used: 1,
      })
      .select('id')
      .single()

    if (insertError || !listing) {
      console.error('[optimize-listing] insert error', insertError)
      return NextResponse.json(
        { error: 'Failed to create listing record' },
        { status: 500 },
      )
    }

    const systemPrompt = getListingSystemPrompt(parsed.data.platform)
    const userPrompt = buildListingUserPrompt({
      platform: parsed.data.platform,
      category: parsed.data.category_name ?? parsed.data.category_id,
      input_title: parsed.data.input_title,
      input_description: parsed.data.input_description,
      input_bullets: parsed.data.input_bullets,
      input_specs: parsed.data.input_specs,
      input_keywords: parsed.data.input_keywords,
      output_language: parsed.data.output_language,
    })

    const aiStream = await streamAIResponse(systemPrompt, userPrompt)

    const captured: string[] = []
    let buffer = ''
    const decoder = new TextDecoder()
    const encoder = new TextEncoder()

    const tap = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        controller.enqueue(chunk)
        buffer += decoder.decode(chunk, { stream: true })
        let idx: number
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const event = buffer.slice(0, idx)
          buffer = buffer.slice(idx + 2)
          if (!event.startsWith('data: ')) continue
          const data = event.slice(6)
          if (data === '[DONE]') continue
          try {
            const obj = JSON.parse(data) as { content?: string }
            if (obj.content) captured.push(obj.content)
          } catch {}
        }
      },
      async flush(controller) {
        const fullText = captured.join('')
        try {
          const result = parseAIJson<OptimizedListing>(fullText)
          await supabase
            .from('listings')
            .update({
              status: 'completed',
              optimized_title: result.optimized_title,
              optimized_bullets: result.optimized_bullets,
              optimized_description: result.optimized_description,
              optimized_backend_keywords: result.backend_keywords,
              seo_score_after: result.seo_score,
            })
            .eq('id', listing.id)

          controller.enqueue(
            encoder.encode(
              `event: meta\ndata: ${JSON.stringify({ listing_id: listing.id, status: 'completed' })}\n\n`,
            ),
          )
        } catch (err) {
          console.error('[optimize-listing] parse/update failed', err)
          await supabase
            .from('listings')
            .update({
              status: 'failed',
              error_message:
                err instanceof Error ? err.message : 'parse_failed',
            })
            .eq('id', listing.id)
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({ listing_id: listing.id, error: 'parse_failed' })}\n\n`,
            ),
          )
        }
      },
    })

    const piped = aiStream.pipeThrough(tap)

    return new Response(piped, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Listing-Id': listing.id,
      },
    })
  } catch (error) {
    console.error('[optimize-listing]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
