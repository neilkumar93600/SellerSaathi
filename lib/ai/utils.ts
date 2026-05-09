import { aiClient, AI_MODEL, AI_BASE_CONFIG, NVIDIA_EXTRA_BODY } from './client'

/**
 * Returns a ReadableStream emitting SSE-formatted chunks.
 * Format: data: {"content":"..."}\n\n  ...  data: [DONE]\n\n
 */
export async function streamAIResponse(
  systemPrompt: string,
  userPrompt: string,
): Promise<ReadableStream<Uint8Array>> {
  const completion = await aiClient.chat.completions.create(
    {
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      ...AI_BASE_CONFIG,
      stream: true,
    },
    {
      // NVIDIA-specific params must go in extra_body, not top-level
      body: NVIDIA_EXTRA_BODY,
    },
  )

  const encoder = new TextEncoder()

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content ?? ''
          if (content) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content })}\n\n`),
            )
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })
}

/**
 * Non-streaming: returns full response text.
 * Use only server-side where streaming is not needed (e.g. webhooks).
 */
export async function getAIResponse(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const completion = await aiClient.chat.completions.create(
    {
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      ...AI_BASE_CONFIG,
      stream: false,
    },
    {
      body: NVIDIA_EXTRA_BODY,
    },
  )
  return completion.choices[0]?.message?.content ?? ''
}

/**
 * Parse JSON from AI response — strips any accidental markdown fences.
 * Throws if JSON is invalid.
 */
export function parseAIJson<T>(raw: string): T {
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  return JSON.parse(stripped) as T
}
