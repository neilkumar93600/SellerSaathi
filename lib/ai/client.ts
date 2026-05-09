import OpenAI from 'openai'

export const aiClient = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY!,
  baseURL: process.env.NVIDIA_BASE_URL ?? 'https://integrate.api.nvidia.com/v1',
})

export const AI_MODEL = process.env.NVIDIA_MODEL ?? 'deepseek-ai/deepseek-v4-pro'

// Base params shared across calls — stream is set per-call
export const AI_BASE_CONFIG = {
  temperature: 0.7,
  top_p: 0.95,
  max_tokens: 4096,
} as const

// NVIDIA DeepSeek reasoning params — passed via extra_body, not top-level
export const NVIDIA_EXTRA_BODY = {
  chat_template_kwargs: { thinking: true, reasoning_effort: 'max' },
} as const
