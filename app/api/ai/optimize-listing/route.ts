import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getListingOptimizationPrompt } from '@/lib/ai/prompts/listing.prompts'

const OptimizeListingSchema = z.object({
  platform: z.enum(['amazon_india', 'flipkart']),
  category_id: z.string(),
  input_title: z.string(),
  input_description: z.string(),
  input_bullets: z.array(z.string()),
  input_specs: z.record(z.string(), z.string()),
  input_keywords: z.string().optional(),
  output_language: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = OptimizeListingSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
    }

    // Check user credits via RPC
    const { data: creditResult, error: creditsError } = await supabase.rpc('get_credits_and_deduct', {
      p_user_id: user.id,
      p_amount: 1
    })

    if (creditsError || !creditResult?.success) {
      return NextResponse.json({ error: 'insufficient_credits' }, { status: 400 })
    }

    // Insert listing row with status processing
    const { data: listing, error: insertError } = await supabase.from('listings').insert({
      user_id: user.id,
      platform_id: parsed.data.platform,
      category_id: parsed.data.category_id,
      input_title: parsed.data.input_title,
      input_description: parsed.data.input_description,
      input_bullets: parsed.data.input_bullets,
      input_specs: parsed.data.input_specs,
      input_keywords: parsed.data.input_keywords,
      output_language: parsed.data.output_language,
      status: 'processing',
      credits_used: 1,
    }).select('id').single()

    if (insertError || !listing) {
      return NextResponse.json({ error: 'Failed to create listing record' }, { status: 500 })
    }

    // Get prompt (this would be sent to the AI)
    const prompt = getListingOptimizationPrompt(parsed.data)

    // TODO: Implement actual NVIDIA DeepSeek streaming integration
    // For now, returning a mocked success since we are setting up infrastructure
    
    // Simulate updating row
    await supabase.from('listings').update({
      status: 'completed',
      optimized_title: "Optimized Title (Mock)",
      optimized_bullets: ["Optimized Bullet 1", "Optimized Bullet 2"],
      optimized_description: "Optimized Description (Mock)",
      seo_score_after: 85,
    }).eq('id', listing.id)

    return NextResponse.json({ 
      data: { 
        listing_id: listing.id,
        message: "Listing optimization completed (Mocked)" 
      } 
    })
  } catch (error) {
    console.error('[optimize-listing]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
