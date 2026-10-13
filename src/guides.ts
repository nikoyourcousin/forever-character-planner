const ORIGIN = 'https://theforeverera.com/en'

const CLASS_IDS = ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid']

const PROFESSION_SLUG: Record<string, string> = {
  alchemy: 'alchemy',
  blacksmithing: 'blacksmithing',
  enchanting: 'enchanting',
  engineering: 'engineering',
  leatherworking: 'leatherworking',
  tailoring: 'tailoring',
  herbalism: 'herbalism',
  mining: 'mining',
  skinning: 'skinning',
  cooking: 'cooking',
  fishing: 'fishing',
  firstaid: 'first-aid',
}

export function classGuide(classId: string): string | null {
  if (!CLASS_IDS.includes(classId)) return null
  return `${ORIGIN}/guides/classes/${classId}/`
}

export function levelingGuide(): string {
  return `${ORIGIN}/guides/leveling/`
}

export function professionGuide(id: string): string | null {
  const slug = PROFESSION_SLUG[id]
  if (!slug) return null
  return `${ORIGIN}/guides/professions/${slug}/`
}

export function chooseProfessionsGuide(): string {
  return `${ORIGIN}/guides/choose-professions/`
}
