import type { Faction, FactionLock, Status } from './types'

export const STATUS_IDS: Status[] = ['idea', 'leveling', 'active', 'parked', 'dead']

export const ALL_ROLES = [
  'main',
  'alt',
  'raid',
  'dungeons',
  'pvp',
  'professions',
  'farm',
  'bank',
  'auction',
  'leveling',
] as const

export const SERVICE_ROLES = ['bank', 'auction'] as const

export const SERVER_IDS = ['pve', 'pvp', 'rp', 'hardcore'] as const

const CLASS_ORDER = [
  'warrior',
  'paladin',
  'hunter',
  'rogue',
  'priest',
  'shaman',
  'mage',
  'warlock',
  'druid',
]

export const CLASS_COLOR: Record<string, string> = {
  warrior: '#c79c6e',
  paladin: '#f58cba',
  hunter: '#abd473',
  rogue: '#fff569',
  priest: '#f3efe4',
  shaman: '#0070de',
  mage: '#69ccf0',
  warlock: '#9482c9',
  druid: '#ff7d0a',
}

export interface RaceOption {
  id: string
  faction: FactionLock
  classes: string[]
}

export interface GameRules {
  levelCap: number
  roles: string[]
  primaryProfessions: string[]
  secondaryProfessions: string[]
  races: RaceOption[]
  specs: Record<string, string[]>
}

function race(id: string, faction: FactionLock, classes: string[]): RaceOption {
  return { id, faction, classes }
}

// Forever beta 1.60.1.70338. New pairs: human hunter, dwarf shaman, gnome priest,
// orc mage, undead paladin, troll warlock, plus the two Skyborne.
const RULES: GameRules = {
  levelCap: 60,
  roles: [...ALL_ROLES],
  primaryProfessions: [
    'alchemy',
    'blacksmithing',
    'enchanting',
    'engineering',
    'leatherworking',
    'tailoring',
    'herbalism',
    'mining',
    'skinning',
  ],
  secondaryProfessions: ['cooking', 'fishing', 'firstaid'],
  races: [
    race('human', 'alliance', ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'mage', 'warlock']),
    race('dwarf', 'alliance', ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman']),
    race('nightelf', 'alliance', ['warrior', 'hunter', 'rogue', 'priest', 'druid']),
    race('gnome', 'alliance', ['warrior', 'rogue', 'priest', 'mage', 'warlock']),
    race('skyborne-high', 'alliance', ['warrior', 'hunter', 'rogue', 'mage', 'druid']),
    race('orc', 'horde', ['warrior', 'hunter', 'rogue', 'shaman', 'mage', 'warlock']),
    race('undead', 'horde', ['warrior', 'paladin', 'rogue', 'priest', 'mage', 'warlock']),
    race('tauren', 'horde', ['warrior', 'hunter', 'shaman', 'druid']),
    race('troll', 'horde', ['warrior', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock']),
    race('skyborne-wind', 'horde', ['warrior', 'hunter', 'rogue', 'shaman', 'druid']),
  ],
  specs: {
    warrior: ['arms', 'fury', 'protection'],
    paladin: ['holy', 'protection', 'retribution'],
    hunter: ['beastmastery', 'marksmanship', 'survival'],
    rogue: ['assassination', 'combat', 'subtlety'],
    priest: ['discipline', 'holy', 'shadow'],
    shaman: ['elemental', 'enhancement', 'restoration'],
    mage: ['arcane', 'fire', 'frost'],
    warlock: ['affliction', 'demonology', 'destruction'],
    druid: ['balance', 'feral', 'restoration'],
  },
}

for (const entry of RULES.races) {
  for (const classId of entry.classes) {
    if (!RULES.specs[classId]?.length) throw new Error(`No specs for ${classId}`)
  }
}

export function getRules(): GameRules {
  return RULES
}

export function racesFor(faction: Faction): RaceOption[] {
  return RULES.races.filter((entry) => entry.faction === 'both' || entry.faction === faction)
}

export function classesFor(raceId: string): string[] {
  const entry = RULES.races.find((race) => race.id === raceId)
  if (!entry) return []
  return [...entry.classes].sort((a, b) => CLASS_ORDER.indexOf(a) - CLASS_ORDER.indexOf(b))
}

export function specsFor(classId: string): string[] {
  return RULES.specs[classId] ?? []
}
