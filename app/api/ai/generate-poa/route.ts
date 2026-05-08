import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPOAGenerationPrompt } from '@/lib/ai/prompts/poa.prompts'

const GeneratePOASchema = z.object({
  platform: z.enum(['amazon_india', 'flipkart']),
  asin_or_listing_id: z.string(),
  suspension_reason: z.string(),
  suspension_notice_text: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = GeneratePOASchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
    }

    // Check user credits via RPC (costs 2 credits)
    const { data: creditResult, error: creditsError } = await supabase.rpc('get_credits_and_deduct', {
      p_user_id: user.id,
      p_amount: 2
    })

    if (creditsError || !creditResult?.success) {
      return NextResponse.json({ error: 'insufficient_credits' }, { status: 400 })
    }

    // Insert poa row with status processing
    const { data: poaRequest, error: insertError } = await supabase.from('poa_requests').insert({
      user_id: user.id,
      platform_id: parsed.data.platform,
      asin_or_listing_id: parsed.data.asin_or_listing_id,
      suspension_reason: parsed.data.suspension_reason,
      suspension_notice_text: parsed.data.suspension_notice_text,
      status: 'processing',
      credits_used: 2,
    }).select('id').single()

    if (insertError || !poaRequest) {
      return NextResponse.json({ error: 'Failed to create POA record' }, { status: 500 })
    }

    // Get prompt (this would be sent to the AI)
    const prompt = getPOAGenerationPrompt(parsed.data)

    // TODO: Implement actual NVIDIA DeepSeek streaming integration
    // For now, returning a mocked success
    
    // Simulate updating row
    await supabase.from('poa_requests').update({
      status: 'completed',
      generated_poa: "Mocked Generated POA Content based on the suspension reason...",
      poa_version: 1,
    }).eq('id', poaRequest.id)

    return NextResponse.json({ 
      data: { 
        poa_id: poaRequest.id,
        message: "POA generation completed (Mocked)" 
      } 
    })
  } catch (error) {
    console.error('[generate-poa]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
