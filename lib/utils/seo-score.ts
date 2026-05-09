interface ListingInput {
  title: string
  bullets: string[]
  description: string
  backend_keywords?: string
  platform: 'amazon_india' | 'flipkart'
}

export function calculateSEOScore(listing: ListingInput): number {
  let score = 0

  const titleLen = listing.title.length
  const optimalTitle = listing.platform === 'amazon_india' ? [150, 200] : [80, 100]
  if (titleLen >= optimalTitle[0] && titleLen <= optimalTitle[1]) score += 20
  else if (titleLen > 50) score += 10

  if (listing.bullets.length >= 5) score += 15

  const avgBulletLen =
    listing.bullets.reduce((a, b) => a + b.length, 0) / (listing.bullets.length || 1)
  if (avgBulletLen >= 200) score += 15
  else if (avgBulletLen >= 100) score += 8

  if (listing.description.length >= 500) score += 15
  else if (listing.description.length >= 200) score += 8

  if (listing.backend_keywords && listing.backend_keywords.length >= 100) score += 15

  const uniqueWords = new Set(listing.title.toLowerCase().split(' ')).size
  if (uniqueWords >= 10) score += 20
  else if (uniqueWords >= 6) score += 10

  return Math.min(100, score)
}
