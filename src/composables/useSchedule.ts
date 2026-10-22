import { ref, watch } from 'vue'
import {
  clearCharacterFromSchedule,
  emptyDay,
  emptySession,
  loadSchedule,
  saveSchedule,
} from '../schedule'
import type { AccountId, PlanDay, PlanSession } from '../types'

export function useSchedule(onError?: () => void) {
  const days = ref<PlanDay[]>(loadSchedule())

  watch(
    days,
    (value) => {
      try {
        saveSchedule(value)
      } catch {
        onError?.()
      }
    },
    { deep: true },
  )

  function replace(next: PlanDay[]) {
    days.value = next
  }

  function addDay() {
    const nextNumber = days.value.reduce((max, day) => Math.max(max, day.day), 0) + 1
    days.value = [...days.value, emptyDay(nextNumber)]
  }

  function removeDay(dayId: string) {
    days.value = days.value.filter((day) => day.id !== dayId)
  }

  function updateDay(dayId: string, patch: Partial<Pick<PlanDay, 'note' | 'day'>>) {
    days.value = days.value.map((day) => (day.id === dayId ? { ...day, ...patch } : day))
  }

  function addSession(dayId: string, account: AccountId) {
    days.value = days.value.map((day) => {
      if (day.id !== dayId) return day
      return { ...day, sessions: [...day.sessions, emptySession(account)] }
    })
  }

  function removeSession(dayId: string, sessionId: string) {
    days.value = days.value.map((day) => {
      if (day.id !== dayId) return day
      return { ...day, sessions: day.sessions.filter((session) => session.id !== sessionId) }
    })
  }

  function upsertSession(dayId: string, session: PlanSession) {
    days.value = days.value.map((day) => {
      if (day.id !== dayId) return day
      const index = day.sessions.findIndex((entry) => entry.id === session.id)
      if (index < 0) return { ...day, sessions: [...day.sessions, session] }
      const sessions = day.sessions.map((entry) => (entry.id === session.id ? session : entry))
      return { ...day, sessions }
    })
  }

  function detachCharacter(characterId: string) {
    days.value = clearCharacterFromSchedule(days.value, characterId)
  }

  return {
    days,
    replace,
    addDay,
    removeDay,
    updateDay,
    addSession,
    removeSession,
    upsertSession,
    detachCharacter,
  }
}
