import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  POA_SYSTEM_PROMPT,
  buildPOAUserPrompt,
} from '@/lib/ai/prompts/poa.prompts'
import { parseAIJson, streamAIResponse } from '@/lib/ai/utils'

const GeneratePOASchema = z.object({
  platform: z.enum(['amazon_india', 'flipkart']),
  asin_or_listing_id: z.string().min(1),
  suspension_reason: z.string().min(1),
  suspension_notice_text: z.string().min(1),
})

type GeneratedPOA = {
  root_cause: string
  corrective_actions: string
  preventive_actions: string
  summary: string
  subject_line: string
}

const POA_CREDIT_COST = 2

function assemblePOA(p: GeneratedPOA): string {
  return [
    `Subject: ${p.subject_line}`,
    '',
    p.summary,
    '',
    '## Root Cause',
    p.root_cause,
    '',
    '## Corrective Actions',
    p.corrective_actions,
    '',
    '## Preventive Actions',
    p.preventive_actions,
  ].join('\n')
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
    const parsed = GeneratePOASchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { data: creditResult, error: creditError } = await supabase.rpc(
      'get_credits_and_deduct',
      { p_user_id: user.id, p_amount: POA_CREDIT_COST },
    )

    if (creditError) {
      console.error('[generate-poa] credit rpc error', creditError)
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

    const { data: poaRequest, error: insertError } = await supabase
      .from('poa_requests')
      .insert({
        user_id: user.id,
        platform_id: parsed.data.platform,
        asin_or_listing_id: parsed.data.asin_or_listing_id,
        suspension_reason: parsed.data.suspension_reason,
        suspension_notice_text: parsed.data.suspension_notice_text,
        status: 'processing',
        credits_used: POA_CREDIT_COST,
      })
      .select('id')
      .single()

    if (insertError || !poaRequest) {
      console.error('[generate-poa] insert error', insertError)
      return NextResponse.json(
        { error: 'Failed to create POA record' },
        { status: 500 },
      )
    }

    const userPrompt = buildPOAUserPrompt({
      platform: parsed.data.platform,
      asin_or_listing_id: parsed.data.asin_or_listing_id,
      suspension_reason: parsed.data.suspension_reason,
      suspension_notice_text: parsed.data.suspension_notice_text,
    })

    const aiStream = await streamAIResponse(POA_SYSTEM_PROMPT, userPrompt)

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
          const result = parseAIJson<GeneratedPOA>(fullText)
          await supabase
            .from('poa_requests')
            .update({
              status: 'completed',
              generated_poa: assemblePOA(result),
              poa_version: 1,
            })
            .eq('id', poaRequest.id)

          controller.enqueue(
            encoder.encode(
              `event: meta\ndata: ${JSON.stringify({ poa_id: poaRequest.id, status: 'completed' })}\n\n`,
            ),
          )
        } catch (err) {
          console.error('[generate-poa] parse/update failed', err)
          await supabase
            .from('poa_requests')
            .update({
              status: 'failed',
              error_message:
                err instanceof Error ? err.message : 'parse_failed',
            })
            .eq('id', poaRequest.id)
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({ poa_id: poaRequest.id, error: 'parse_failed' })}\n\n`,
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
        'X-Poa-Id': poaRequest.id,
      },
    })
  } catch (error) {
    console.error('[generate-poa]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
