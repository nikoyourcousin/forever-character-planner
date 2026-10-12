export type Faction = 'alliance' | 'horde'

export type FactionLock = Faction | 'both'

export type Status = 'idea' | 'leveling' | 'active' | 'parked' | 'dead'

export type Server = 'pve' | 'pvp' | 'rp' | 'hardcore'

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
  status: Status
  notes: string
  updatedAt: number
}

export function characterName(character: Pick<Character, 'name' | 'surname'>): string {
  const surname = character.surname.trim()
  return surname ? `${character.name} ${surname}` : character.name
}
