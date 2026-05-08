export type POAFormData = {
  platform: 'amazon_india' | 'flipkart'
  asin_or_listing_id: string
  suspension_reason: string
  suspension_notice_text: string
}

export type POAResult = {
  root_cause: string
  corrective_actions: string
  preventive_actions: string
  summary: string
  subject_line: string
}
