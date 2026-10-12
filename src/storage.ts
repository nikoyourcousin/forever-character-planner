import { classesFor, getRules, SERVER_IDS, specsFor } from './data'
import type { Character, Faction, Server, Status } from './types'

const KEY = 'fcp-roster-v1'
const LEGACY_KEY = 'wow-roster-v1'
const FACTIONS: Faction[] = ['alliance', 'horde']
const STATUSES: Status[] = ['idea', 'leveling', 'active', 'parked', 'dead']

export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `c-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function asServer(source: Record<string, unknown>): Server | '' {
  const raw = typeof source.server === 'string' ? source.server : typeof source.realm === 'string' ? source.realm : ''
  const key = raw.trim().toLowerCase()
  return (SERVER_IDS as readonly string[]).includes(key) ? (key as Server) : ''
}

function asStringList(value: unknown, allowed: string[], max?: number): string[] | null {
  if (!Array.isArray(value)) return null
  const next: string[] = []
  for (const item of value) {
    if (typeof item === 'string' && allowed.includes(item) && !next.includes(item)) next.push(item)
  }
  return max != null && next.length > max ? next.slice(0, max) : next
}

export function normalizeCharacter(input: unknown): Character | null {
  if (!input || typeof input !== 'object') return null
  const source = input as Record<string, unknown>
  if (source.version != null && source.version !== 'forever') return null
  const rules = getRules()
  const faction = source.faction
  if (typeof faction !== 'string' || !FACTIONS.includes(faction as Faction)) return null
  const race = source.race
  if (typeof race !== 'string') return null
  const raceOption = rules.races.find((entry) => entry.id === race)
  if (!raceOption || (raceOption.faction !== 'both' && raceOption.faction !== faction)) return null
  const classId = source.classId
  if (typeof classId !== 'string' || !classesFor(race).includes(classId)) return null
  const spec = source.spec
  if (typeof spec !== 'string' || !specsFor(classId).includes(spec)) return null
  const name = typeof source.name === 'string' ? source.name.trim() : ''
  if (name.length < 1 || name.length > 24) return null
  const surname = typeof source.surname === 'string' ? source.surname.trim().slice(0, 12) : ''
  const server = asServer(source)
  const notes = typeof source.notes === 'string' ? source.notes.trim().slice(0, 500) : ''
  const primaries = asStringList(source.primaries, rules.primaryProfessions, 2)
  const secondaries = asStringList(source.secondaries, rules.secondaryProfessions)
  const roles = asStringList(source.roles, rules.roles)
  if (!primaries || !secondaries || !roles) return null
  const status = source.status
  if (typeof status !== 'string' || !STATUSES.includes(status as Status)) return null
  let level: number | null = null
  if (source.level != null) {
    if (typeof source.level !== 'number' || !Number.isInteger(source.level)) return null
    if (source.level < 1 || source.level > rules.levelCap) return null
    level = source.level
  }
  const id = typeof source.id === 'string' && source.id.trim() ? source.id : newId()
  const updatedAt = typeof source.updatedAt === 'number' ? source.updatedAt : Date.now()
  return {
    id,
    name,
    surname,
    faction: faction as Faction,
    race,
    classId,
    spec,
    primaries,
    secondaries,
    roles,
    level,
    server,
    status: status as Status,
    notes,
    updatedAt,
  }
}

function readList(raw: string | null): Character[] | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    const list = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === 'object' && Array.isArray((parsed as { characters?: unknown }).characters)
        ? (parsed as { characters: unknown[] }).characters
        : null
    if (!list) return []
    return list.map(normalizeCharacter).filter((item): item is Character => item != null)
  } catch {
    return []
  }
}

export function loadCharacters(): Character[] {
  try {
    const current = localStorage.getItem(KEY)
    if (current != null) return readList(current) ?? []
    const legacy = readList(localStorage.getItem(LEGACY_KEY)) ?? []
    if (legacy.length) localStorage.setItem(KEY, JSON.stringify(legacy))
    return legacy
  } catch {
    return []
  }
}

export function saveCharacters(characters: Character[]) {
  localStorage.setItem(KEY, JSON.stringify(characters))
}

export function serializeRoster(characters: Character[]): string {
  return JSON.stringify({ version: 1, characters }, null, 2)
}

export interface ImportReport {
  characters: Character[]
  added: number
  updated: number
  skipped: number
}

export function parseImport(raw: string, existing: Character[]): ImportReport | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  const list = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && Array.isArray((parsed as { characters?: unknown }).characters)
      ? (parsed as { characters: unknown[] }).characters
      : null
  if (!list) return null
  const next = [...existing]
  let added = 0
  let updated = 0
  let skipped = 0
  for (const item of list) {
    const character = normalizeCharacter(item)
    if (!character) {
      skipped += 1
      continue
    }
    const index = next.findIndex((entry) => entry.id === character.id)
    if (index >= 0) {
      next[index] = character
      updated += 1
    } else {
      next.push(character)
      added += 1
    }
  }
  return { characters: next, added, updated, skipped }
}
