import { ListingFormData } from "@/types/listing.types";

export function getListingOptimizationPrompt(data: ListingFormData): string {
  return `
You are an expert e-commerce SEO copywriter for ${data.platform}.
Optimize the following product listing:
Title: ${data.input_title}
Description: ${data.input_description}
Bullets: ${data.input_bullets.join("\n")}
Specs: ${JSON.stringify(data.input_specs)}
Keywords: ${data.input_keywords}
Language: ${data.output_language}

Return a valid JSON object matching the ListingResult type.
  `;
}
