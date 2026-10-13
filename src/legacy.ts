import type { Character } from './types'

export const LEGACY_GOAL = 55
export const LEGACY_TOTAL = 65
export const LEGACY_KEY = 'fcp-legacy-v1'

export const LEGACY_REWARDS = [
  { id: 'rifle', points: 15 },
  { id: 'cub', points: 25 },
  { id: 'tabard', points: 40 },
  { id: 'mount', points: 55 },
] as const

export type LegacyRewardId = (typeof LEGACY_REWARDS)[number]['id']

export const LEGACY_CATEGORIES = [
  'class',
  'profession',
  'dungeon',
  'raid',
  'pvp',
  'reputation',
  'adventure',
  'season',
] as const

export type LegacyCategory = (typeof LEGACY_CATEGORIES)[number]

export const SIDE_GROUPS: LegacyCategory[] = ['dungeon', 'raid', 'pvp', 'reputation', 'adventure', 'season']

const CLASS_IDS = ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid']
const CLASS_LEVELS = [25, 45, 60]
const PROFESSION_IDS = ['alchemy', 'engineering', 'leatherworking', 'blacksmithing', 'tailoring', 'enchanting']
const CRAFTING_IDS = new Set(PROFESSION_IDS)
const PROFESSION_SKILLS = [150, 225, 300]

export interface LegacyChallenge {
  id: string
  category: LegacyCategory
  subject?: string
  threshold?: number
}

function steps(
  category: 'class' | 'profession',
  subjects: string[],
  thresholds: number[],
): LegacyChallenge[] {
  return subjects.flatMap((subject) =>
    thresholds.map((threshold) => ({
      id: `${category}:${subject}:${threshold}`,
      category,
      subject,
      threshold,
    })),
  )
}

function listed(category: LegacyCategory, ids: string[]): LegacyChallenge[] {
  return ids.map((id) => ({ id: `${category}:${id}`, category }))
}

export const LEGACY_CHALLENGES: LegacyChallenge[] = [
  ...steps('class', CLASS_IDS, CLASS_LEVELS),
  ...steps('profession', PROFESSION_IDS, PROFESSION_SKILLS),
  ...listed('dungeon', ['15-25', '26-45', '46-60']),
  ...listed('raid', ['onyxia', 'hyjal', 'deeps']),
  ...listed('pvp', ['3', '7', '10', '13', '14']),
  ...listed('reputation', ['warsong', 'arathi', 'alterac', 'islands']),
  ...listed('adventure', ['explore', 'valthalak']),
  ...listed('season', ['4', '7', '10']),
]

const LEGACY_ID_LIST = LEGACY_CHALLENGES.map((challenge) => challenge.id)
const LEGACY_ID_SET = new Set(LEGACY_ID_LIST)

if (LEGACY_ID_SET.size !== LEGACY_ID_LIST.length || LEGACY_ID_LIST.length !== LEGACY_TOTAL) {
  throw new Error(`Legacy challenges: ${LEGACY_ID_LIST.length}`)
}

export interface LegacyTrack {
  subject: string
  steps: LegacyChallenge[]
}

export function tracks(category: 'class' | 'profession'): LegacyTrack[] {
  const rows: LegacyTrack[] = []
  for (const challenge of LEGACY_CHALLENGES) {
    if (challenge.category !== category || !challenge.subject) continue
    let row = rows.find((entry) => entry.subject === challenge.subject)
    if (!row) {
      row = { subject: challenge.subject, steps: [] }
      rows.push(row)
    }
    row.steps.push(challenge)
  }
  return rows
}

export function challengesBy(category: LegacyCategory): LegacyChallenge[] {
  return LEGACY_CHALLENGES.filter((challenge) => challenge.category === category)
}

export function legacyCapacity(characters: Character[]): Set<string> {
  const living = characters.filter((character) => character.status !== 'dead')
  const open = new Set<string>()
  if (!living.length) return open
  const classes = new Set(living.map((character) => character.classId))
  const professions = new Set<string>()
  for (const character of living) {
    for (const id of character.primaries) {
      if (CRAFTING_IDS.has(id)) professions.add(id)
    }
  }
  for (const challenge of LEGACY_CHALLENGES) {
    if (challenge.category === 'class') {
      if (challenge.subject && classes.has(challenge.subject)) open.add(challenge.id)
    } else if (challenge.category === 'profession') {
      if (challenge.subject && professions.has(challenge.subject)) open.add(challenge.id)
    } else {
      open.add(challenge.id)
    }
  }
  return open
}

const LADDER_CATEGORIES = new Set<LegacyCategory>(['class', 'profession', 'pvp'])

function ladder(id: string): LegacyChallenge[] {
  const step = LEGACY_CHALLENGES.find((challenge) => challenge.id === id)
  if (!step || !LADDER_CATEGORIES.has(step.category)) return step ? [step] : []
  if (step.category === 'pvp') return challengesBy('pvp')
  return LEGACY_CHALLENGES.filter(
    (challenge) => challenge.category === step.category && challenge.subject === step.subject,
  )
}

export function applyLegacyToggle(current: string[], id: string): string[] {
  if (!LEGACY_ID_SET.has(id)) return current
  const chain = ladder(id)
  const index = chain.findIndex((challenge) => challenge.id === id)
  if (index < 0) return current
  if (current.includes(id)) {
    const drop = new Set(chain.slice(index).map((challenge) => challenge.id))
    return current.filter((item) => !drop.has(item))
  }
  const add = chain.slice(0, index + 1).map((challenge) => challenge.id)
  return normalizeLegacy([...current, ...add]) ?? current
}

export function normalizeLegacy(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null
  const next: string[] = []
  for (const item of value) {
    if (typeof item === 'string' && LEGACY_ID_SET.has(item) && !next.includes(item)) next.push(item)
  }
  return next
}

export function loadLegacy(): string[] {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return []
    return normalizeLegacy(JSON.parse(raw) as unknown) ?? []
  } catch {
    return []
  }
}

export function saveLegacy(ids: string[]) {
  localStorage.setItem(LEGACY_KEY, JSON.stringify(ids))
}
