import { ref, watch } from 'vue'
import { t, tf } from '../i18n'
import { loadCharacters, newId, parseImport, saveCharacters, serializeRoster } from '../storage'
import type { Character, PlanDay } from '../types'

export function useRoster() {
  const characters = ref<Character[]>(loadCharacters())
  const notice = ref('')
  const importedLegacy = ref<string[] | null>(null)
  const importedSchedule = ref<PlanDay[] | null>(null)

  watch(characters, (value) => {
    try {
      saveCharacters(value)
    } catch {
      notice.value = t('ui.storageFailed')
    }
  })

  function dismissNotice() {
    notice.value = ''
  }

  function upsert(character: Character) {
    const index = characters.value.findIndex((entry) => entry.id === character.id)
    if (index >= 0) {
      characters.value = characters.value.map((entry) => (entry.id === character.id ? character : entry))
    } else {
      characters.value = [character, ...characters.value]
    }
  }

  function remove(id: string) {
    characters.value = characters.value.filter((entry) => entry.id !== id)
  }

  function duplicate(character: Character) {
    const suffix = t('ui.copySuffix')
    const limit = 12
    const next = `${character.name}${suffix}`
    const name = next.length <= limit ? next : `${character.name.slice(0, Math.max(1, limit - suffix.length))}${suffix}`
    upsert({
      ...character,
      id: newId(),
      name,
      primaries: [...character.primaries],
      secondaries: [...character.secondaries],
      roles: character.roles.filter((role) => role !== 'main'),
      updatedAt: Date.now(),
    })
  }

  function exportRoster(legacyIds: string[], schedule: PlanDay[] = []) {
    if (!characters.value.length && legacyIds.length === 0 && schedule.length === 0) {
      notice.value = t('ui.exportEmpty')
      return
    }
    const blob = new Blob([serializeRoster(characters.value, legacyIds, schedule)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'fcp-roster.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  function importText(raw: string): boolean {
    const report = parseImport(raw, characters.value)
    if (!report) {
      notice.value = t('ui.importFailed')
      return false
    }
    characters.value = report.characters
    importedLegacy.value = report.legacy
    importedSchedule.value = report.schedule
    notice.value = tf('ui.importResult', {
      added: report.added,
      updated: report.updated,
      skipped: report.skipped,
    })
    return true
  }

  function takeSchedule() {
    const marks = importedSchedule.value
    importedSchedule.value = null
    return marks
  }

  return {
    characters,
    notice,
    importedLegacy,
    importedSchedule,
    dismissNotice,
    upsert,
    remove,
    duplicate,
    exportRoster,
    importText,
    takeSchedule,
  }
}
