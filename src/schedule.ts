import { getRules } from './data'
import { ACCOUNT_IDS, type AccountId, type PlanDay, type PlanSession } from './types'

export const SCHEDULE_KEY = 'fcp-schedule-v1'

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `s-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function asAccount(value: unknown): AccountId | null {
  return typeof value === 'string' && (ACCOUNT_IDS as readonly string[]).includes(value) ? (value as AccountId) : null
}

export function normalizeSession(input: unknown): PlanSession | null {
  if (!input || typeof input !== 'object') return null
  const source = input as Record<string, unknown>
  const account = asAccount(source.account)
  if (!account) return null
  const characterId =
    typeof source.characterId === 'string' && source.characterId.trim() ? source.characterId.trim() : null
  let targetLevel: number | null = null
  if (source.targetLevel != null) {
    if (typeof source.targetLevel !== 'number' || !Number.isInteger(source.targetLevel)) return null
    const cap = getRules().levelCap
    if (source.targetLevel < 1 || source.targetLevel > cap) return null
    targetLevel = source.targetLevel
  }
  const activity = typeof source.activity === 'string' ? source.activity.trim().slice(0, 500) : ''
  const id = typeof source.id === 'string' && source.id.trim() ? source.id : newId()
  return { id, account, characterId, targetLevel, activity }
}

export function normalizeDay(input: unknown): PlanDay | null {
  if (!input || typeof input !== 'object') return null
  const source = input as Record<string, unknown>
  if (typeof source.day !== 'number' || !Number.isInteger(source.day) || source.day < 1) return null
  const note = typeof source.note === 'string' ? source.note.trim().slice(0, 500) : ''
  const rawSessions = Array.isArray(source.sessions) ? source.sessions : []
  const sessions = rawSessions.map(normalizeSession).filter((item): item is PlanSession => item != null)
  const id = typeof source.id === 'string' && source.id.trim() ? source.id : newId()
  return { id, day: source.day, note, sessions }
}

export function normalizeSchedule(input: unknown): PlanDay[] | null {
  if (!Array.isArray(input)) return null
  return input
    .map(normalizeDay)
    .filter((item): item is PlanDay => item != null)
    .sort((a, b) => a.day - b.day)
}

export function loadSchedule(): PlanDay[] {
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY)
    if (!raw) return []
    return normalizeSchedule(JSON.parse(raw)) ?? []
  } catch {
    return []
  }
}

export function saveSchedule(days: PlanDay[]) {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(days))
}

export function emptySession(account: AccountId): PlanSession {
  return {
    id: newId(),
    account,
    characterId: null,
    targetLevel: null,
    activity: '',
  }
}

export function emptyDay(day: number): PlanDay {
  return {
    id: newId(),
    day,
    note: '',
    sessions: [emptySession('wow1'), emptySession('wow2')],
  }
}

export function clearCharacterFromSchedule(days: PlanDay[], characterId: string): PlanDay[] {
  let changed = false
  const next = days.map((day) => {
    let dayChanged = false
    const sessions = day.sessions.map((session) => {
      if (session.characterId !== characterId) return session
      dayChanged = true
      changed = true
      return { ...session, characterId: null }
    })
    return dayChanged ? { ...day, sessions } : day
  })
  return changed ? next : days
}
