export interface EnrichedAuthor {
  slug: string
  birthDeath: string
  nationality: string
  movement: string[]
  movementDesc?: string
  movementTraits?: string[]
  bio: string[]
  controversies: { tag: string; content: string }[]
  works: { year: string; title: string; type: string; note?: string }[]
  position: string
  positionSource?: string
  englishName?: string
  nobelYear?: number | null
}
