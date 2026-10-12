const ICON_BASE = 'https://wow.zamimg.com/images/wow/icons/large'

export function iconUrl(file: string): string {
  return `${ICON_BASE}/${file}.jpg`
}

export const RACE_ICON: Record<string, string> = {
  human: 'race_human_male',
  dwarf: 'race_dwarf_male',
  nightelf: 'race_nightelf_male',
  gnome: 'race_gnome_male',
  'skyborne-high': 'race_skyborne_male',
  orc: 'race_orc_male',
  undead: 'race_scourge_male',
  tauren: 'race_tauren_male',
  troll: 'race_troll_male',
  'skyborne-wind': 'race_skyborne_female',
}

export const CLASS_ICON: Record<string, string> = {
  warrior: 'classicon_warrior',
  paladin: 'classicon_paladin',
  hunter: 'classicon_hunter',
  rogue: 'classicon_rogue',
  priest: 'classicon_priest',
  shaman: 'classicon_shaman',
  mage: 'classicon_mage',
  warlock: 'classicon_warlock',
  druid: 'classicon_druid',
}

export const PROFESSION_ICON: Record<string, string> = {
  alchemy: 'trade_alchemy',
  blacksmithing: 'trade_blacksmithing',
  enchanting: 'trade_engraving',
  engineering: 'trade_engineering',
  herbalism: 'trade_herbalism',
  leatherworking: 'trade_leatherworking',
  mining: 'trade_mining',
  skinning: 'inv_misc_pelt_wolf_01',
  tailoring: 'trade_tailoring',
  cooking: 'inv_misc_food_15',
  fishing: 'trade_fishing',
  firstaid: 'inv_misc_bandage_16',
}

export const FACTION_ICON = {
  alliance: 'ui_allianceicon',
  horde: 'ui_hordeicon',
} as const

export function professionIcon(id: string): string {
  return PROFESSION_ICON[id] ?? ''
}
