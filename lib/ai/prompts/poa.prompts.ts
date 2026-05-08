import { POAFormData } from "@/types/poa.types";

export function getPOAGenerationPrompt(data: POAFormData): string {
  return `
You are an expert seller reinstatement specialist for ${data.platform}.
Generate a Plan of Action (POA) for the following suspension:
ASIN/Listing ID: ${data.asin_or_listing_id}
Reason: ${data.suspension_reason}
Notice: ${data.suspension_notice_text}

Return a valid JSON object matching the POAResult type.
  `;
}
