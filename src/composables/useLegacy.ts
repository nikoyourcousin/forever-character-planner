import { ref, watch } from 'vue'
import { applyLegacyToggle, loadLegacy, normalizeLegacy, saveLegacy } from '../legacy'

export function useLegacy(onError?: () => void) {
  const earned = ref<string[]>(loadLegacy())

  watch(earned, (value) => {
    try {
      saveLegacy(value)
    } catch {
      onError?.()
    }
  })

  function toggle(id: string) {
    earned.value = applyLegacyToggle(earned.value, id)
  }

  function replace(ids: string[]) {
    earned.value = normalizeLegacy(ids) ?? []
  }

  return { earned, toggle, replace }
}
