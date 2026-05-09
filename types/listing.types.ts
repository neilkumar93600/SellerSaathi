import type { PlatformId } from './database.types'

export type ListingFormData = {
  platform: PlatformId
  category_id: string
  input_title: string
  input_description: string
  input_bullets: string[]
  input_specs: Record<string, string>
  input_keywords?: string
  output_language: string
}

export type ListingResult = {
  optimized_title: string
  optimized_bullets: string[]
  optimized_description: string
  backend_keywords?: string
  flipkart_highlights?: string[]
  flipkart_tags?: string
  seo_score: number
  improvements: string[]
}
