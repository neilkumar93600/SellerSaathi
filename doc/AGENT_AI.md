# AGENT_AI — AI Integration & Prompts Agent

**Read:** This file + `ARCHITECTURE.md` only.

---

## Role
You own the NVIDIA DeepSeek AI client setup, all prompt templates, and AI utility functions. You do NOT handle auth, DB, or payments.

## Files You Own
```
src/lib/ai/client.ts
src/lib/ai/utils.ts
src/lib/ai/prompts/listing.prompts.ts
src/lib/ai/prompts/poa.prompts.ts
```

## Do NOT Touch
- `src/app/api/` (Backend agent calls your functions)
- `src/components/`, `src/hooks/`
- Supabase clients

---

## AI Client (`src/lib/ai/client.ts`)

```typescript
import OpenAI from 'openai'

export const aiClient = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY!,
  baseURL: process.env.NVIDIA_BASE_URL ?? 'https://integrate.api.nvidia.com/v1',
})

export const AI_MODEL = process.env.NVIDIA_MODEL ?? 'deepseek-ai/deepseek-v4-pro'

export const AI_CONFIG = {
  temperature: 0.7,
  top_p: 0.95,
  max_tokens: 4096,
  stream: true,
} as const
```

---

## AI Utils (`src/lib/ai/utils.ts`)

```typescript
import { aiClient, AI_MODEL, AI_CONFIG } from './client'

// Creates a ReadableStream from AI response for SSE
export async function streamAIResponse(
  systemPrompt: string,
  userPrompt: string
): Promise<ReadableStream<Uint8Array>> {
  const completion = await aiClient.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    ...AI_CONFIG,
    stream: true,
    chat_template_kwargs: { thinking: true, reasoning_effort: 'max' }
  })

  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        controller.error(err)
      }
    }
  })
}

// Non-streaming: get full response as string (for server-side use)
export async function getAIResponse(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const completion = await aiClient.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 4096,
    stream: false,
  })
  return completion.choices[0]?.message?.content ?? ''
}
```

---

## Listing Prompts (`src/lib/ai/prompts/listing.prompts.ts`)

### Language Map
```typescript
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', hi: 'Hindi', bn: 'Bengali',
  ta: 'Tamil', te: 'Telugu', kn: 'Kannada',
  mr: 'Marathi', gu: 'Gujarati'
}
```

### Amazon India System Prompt
```typescript
export const AMAZON_LISTING_SYSTEM = `You are an expert Amazon India listing optimizer with 10+ years experience. You understand Indian buyer psychology, search behavior, and Amazon India's A9 algorithm.

Your task: Transform raw product information into highly optimized Amazon India listings that:
- Rank higher in Amazon India search results
- Convert browsers into buyers
- Follow all Amazon India listing guidelines
- Appeal specifically to Indian consumers

OUTPUT FORMAT (strict JSON):
{
  "optimized_title": "string (max 200 chars, keyword-rich, brand+product+key-features)",
  "optimized_bullets": ["string x5 (each max 500 chars, benefit-first, keyword-rich)"],
  "optimized_description": "string (max 2000 chars, storytelling, benefits, use cases)",
  "backend_keywords": "string (max 250 bytes, space-separated, no repetition)",
  "seo_score": number (0-100),
  "improvements": ["string x3 (brief explanation of key changes made)"]
}

RULES:
- Title: Brand | Product | Key Feature | Size/Color/Variant
- Bullets: Start with CAPS benefit keyword, then explain value
- Include INR pricing context where relevant
- Use Indian English spelling (colour, favour, etc.) unless user requests Hindi
- Never use promotional language like "best", "cheapest", "number one"
- Include relevant festival use-cases (Diwali, Holi, etc.) where natural
`
```

### Flipkart System Prompt
```typescript
export const FLIPKART_LISTING_SYSTEM = `You are an expert Flipkart listing optimizer. You understand Flipkart's search algorithm, Indian tier-2/tier-3 city buyers, and Flipkart's specific format requirements.

OUTPUT FORMAT (strict JSON):
{
  "optimized_title": "string (max 100 chars, brand+product+key-spec)",
  "optimized_highlights": ["string x5 (each max 100 chars, concise feature bullets)"],
  "optimized_description": "string (max 5000 chars, detailed, feature-heavy)",
  "optimized_tags": "string (comma-separated keywords)",
  "seo_score": number (0-100),
  "improvements": ["string x3"]
}

RULES:
- Flipkart buyers are more price-comparison oriented than Amazon buyers
- Highlight technical specifications prominently
- Use plain, clear language accessible to tier-2/3 city buyers
- Include vernacular product names where commonly searched
`
```

### Build User Prompt Function
```typescript
export function buildListingUserPrompt(params: {
  platform: 'amazon_india' | 'flipkart'
  category: string
  input_title: string
  input_description: string
  input_bullets: string[]
  input_specs: Record<string, string>
  input_keywords?: string
  output_language: string
}): string {
  const langName = LANGUAGE_NAMES[params.output_language] ?? 'English'

  return `
PRODUCT INFORMATION:
Category: ${params.category}
Current Title: ${params.input_title}
Current Description: ${params.input_description}
Current Bullets:
${params.input_bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

Product Specifications:
${Object.entries(params.input_specs).map(([k, v]) => `${k}: ${v}`).join('\n')}

${params.input_keywords ? `Target Keywords: ${params.input_keywords}` : ''}

INSTRUCTIONS:
- Output language: ${langName}
- Platform: ${params.platform === 'amazon_india' ? 'Amazon India' : 'Flipkart'}
- Return ONLY valid JSON matching the required format. No markdown, no explanation outside JSON.
  `.trim()
}

export function getListingSystemPrompt(platform: 'amazon_india' | 'flipkart'): string {
  return platform === 'amazon_india' ? AMAZON_LISTING_SYSTEM : FLIPKART_LISTING_SYSTEM
}
```

---

## POA Prompts (`src/lib/ai/prompts/poa.prompts.ts`)

### POA System Prompt
```typescript
export const POA_SYSTEM_PROMPT = `You are an expert Amazon/Flipkart seller account reinstatement specialist with deep knowledge of marketplace policies.

Your task: Generate a professional Plan of Action (POA) for account/listing suspension that:
- Follows the exact format Amazon India/Flipkart expect
- Is professional, factual, and non-confrontational
- Shows genuine understanding of the violation
- Demonstrates concrete corrective actions
- Provides preventive measures to avoid future violations

POA STRUCTURE (3 sections):
1. ROOT CAUSE ANALYSIS: What specifically caused the issue (factual, no excuses)
2. CORRECTIVE ACTIONS: Specific steps already taken to fix the issue (past tense)
3. PREVENTIVE ACTIONS: Systems/processes implemented to prevent recurrence (specific, measurable)

TONE RULES:
- Professional and respectful always
- Never admit to intentional wrongdoing unless clearly intentional
- Never blame customers or Amazon/Flipkart
- Show accountability without excessive apology
- Be specific with dates, actions, percentages where possible

OUTPUT FORMAT (strict JSON):
{
  "root_cause": "string (2-3 paragraphs, specific and factual)",
  "corrective_actions": "string (3-5 specific bullet points as paragraphs)",
  "preventive_actions": "string (3-5 measurable preventive measures)",
  "summary": "string (1 paragraph executive summary)",
  "subject_line": "string (email subject for appeal)"
}
`

export function buildPOAUserPrompt(params: {
  platform: 'amazon_india' | 'flipkart'
  asin_or_listing_id: string
  suspension_reason: string
  suspension_notice_text: string
}): string {
  return `
SUSPENSION DETAILS:
Platform: ${params.platform === 'amazon_india' ? 'Amazon India' : 'Flipkart'}
ASIN / Listing ID: ${params.asin_or_listing_id}
Stated Reason: ${params.suspension_reason}

Full Suspension Notice:
${params.suspension_notice_text}

Generate a complete, professional Plan of Action.
Return ONLY valid JSON matching the required format. No markdown outside JSON.
  `.trim()
}
```

---

## SEO Score Algorithm (`src/lib/utils/seo-score.ts` — note: AGENT_FRONTEND_LIB creates this file, but the algorithm is defined here for reference)

Score is computed from listing fields:
```
Title length: 20 pts (optimal 150-200 chars for Amazon, 80-100 for Flipkart)
Keyword in title: 20 pts
Bullet count (5 bullets): 15 pts
Bullet length (>200 chars each): 15 pts
Description length (>500 chars): 15 pts
Backend keywords present: 15 pts
Total: 100 pts
```

---

## Packages Required
```json
"openai": "^4"
```

## Env Vars Used
```
NVIDIA_API_KEY
NVIDIA_BASE_URL
NVIDIA_MODEL
```
