export type Faction = 'alliance' | 'horde'

export type FactionLock = Faction | 'both'

export type Status = 'idea' | 'leveling' | 'active' | 'parked' | 'dead'

export type Server = 'pve' | 'pvp' | 'rp' | 'hardcore'

export type AccountId = 'wow1' | 'wow2'

export const ACCOUNT_IDS: AccountId[] = ['wow1', 'wow2']

export interface Character {
  id: string
  name: string
  surname: string
  faction: Faction
  race: string
  classId: string
  spec: string
  primaries: string[]
  secondaries: string[]
  roles: string[]
  level: number | null
  server: Server | ''
  account: AccountId | ''
  status: Status
  notes: string
  updatedAt: number
}

export interface PlanSession {
  id: string
  account: AccountId
  characterId: string | null
  targetLevel: number | null
  activity: string
}

export interface PlanDay {
  id: string
  day: number
  note: string
  sessions: PlanSession[]
}

export function characterName(character: Pick<Character, 'name' | 'surname'>): string {
  const surname = character.surname.trim()
  return surname ? `${character.name} ${surname}` : character.name
}
