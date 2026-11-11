import type { EnrichedAuthor } from './types'
import { branchMovements } from './branchMovements'
import { enrichedAuthors as overrides } from '../enrichedAuthors'
import indexMap from './indexMap.json'
import data from '../authors.json'
import type { Author } from '@/types'

const authors = data.authors as Author[]
const groupOf = indexMap as Record<string, string>

// Each author group is a separate chunk; only the group holding the current
// author is fetched, keeping the initial bundle small.
const loaders: Record<string, () => Promise<Record<string, EnrichedAuthor>>> = {
  g1: () => import('./g1').then(m => m.g1),
  g2: () => import('./g2').then(m => m.g2),
  g3: () => import('./g3').then(m => m.g3),
  g4: () => import('./g4').then(m => m.g4),
  g5: () => import('./g5').then(m => m.g5),
  g6: () => import('./g6').then(m => m.g6),
  g7: () => import('./g7').then(m => m.g7),
  g8: () => import('./g8').then(m => m.g8),
}

export async function loadEnrichedAuthor(
  name: string,
  slug: string,
): Promise<EnrichedAuthor | undefined> {
  let base: EnrichedAuthor | undefined = overrides[slug]

  if (!base) {
    const group = groupOf[slug]
    if (group && loaders[group]) {
      base = (await loaders[group]())[slug]
    }
  }

  if (!base) return undefined

  const author = authors.find(a => a.slug === slug)
  const mv = author ? branchMovements[author.branch] : undefined

  return {
    ...base,
    movement: base.movement && base.movement.length > 0 ? base.movement : mv ? [mv.name] : [],
    movementDesc: base.movementDesc ?? mv?.desc,
    movementTraits: base.movementTraits ?? mv?.traits,
    bio: base.bio && base.bio.length > 0 ? base.bio : [`${name}，${author?.era ?? ''}。`],
    works: base.works && base.works.length > 0
      ? base.works
      : (author?.works ?? []).map(w => ({ year: '', title: w, type: '作品' })),
    position: base.position || author?.reason || '',
  }
}

export type { EnrichedAuthor }
