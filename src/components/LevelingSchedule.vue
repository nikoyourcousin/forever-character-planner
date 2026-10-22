<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { getRules } from '../data'
import { CLASS_ICON, RACE_ICON } from '../icons'
import { t, tf } from '../i18n'
import { emptySession } from '../schedule'
import { ACCOUNT_IDS, characterName, type AccountId, type Character, type PlanDay, type PlanSession } from '../types'
import Dropdown from './Dropdown.vue'
import WowIcon from './WowIcon.vue'

const props = defineProps<{
  days: PlanDay[]
  characters: Character[]
}>()

const emit = defineEmits<{
  back: []
  addDay: []
  removeDay: [dayId: string]
  removeSession: [dayId: string, sessionId: string]
  upsertSession: [dayId: string, session: PlanSession]
}>()

const levelCap = computed(() => getRules().levelCap)
const sortedDays = computed(() => [...props.days].sort((a, b) => a.day - b.day))

function findCharacter(id: string | null) {
  if (!id) return null
  return props.characters.find((character) => character.id === id) ?? null
}

function characterLabel(id: string | null, character: Character | null = findCharacter(id)) {
  if (character) return characterName(character)
  if (id) return t('schedule.missingCharacter')
  return t('schedule.noCharacter')
}

function slotsFor(day: PlanDay, account: AccountId) {
  return day.sessions
    .filter((session) => session.account === account)
    .map((session) => {
      const character = findCharacter(session.characterId)
      return {
        session,
        character,
        label: characterLabel(session.characterId, character),
        empty: !session.characterId && session.targetLevel == null && !session.activity.trim(),
      }
    })
}

const editorOpen = ref(false)
const editorDayId = ref('')
const editorDialog = ref<HTMLDialogElement | null>(null)
const draft = reactive({
  id: '',
  account: 'wow1' as AccountId,
  characterId: '',
  targetLevelText: '',
  activity: '',
})

const characterOptions = computed(() => {
  const preferred = props.characters.filter(
    (character) => !character.account || character.account === draft.account,
  )
  const rest = props.characters.filter((character) => character.account && character.account !== draft.account)
  const list = [...preferred, ...rest]
  return [
    { value: '', label: t('schedule.noCharacter') },
    ...list.map((character) => ({
      value: character.id,
      label: character.account
        ? `${characterName(character)} · ${t(`account.${character.account}`)}`
        : characterName(character),
    })),
  ]
})

function openEditor(dayId: string, session: PlanSession) {
  editorDayId.value = dayId
  draft.id = session.id
  draft.account = session.account
  draft.characterId = session.characterId ?? ''
  draft.targetLevelText = session.targetLevel == null ? '' : String(session.targetLevel)
  draft.activity = session.activity
  editorOpen.value = true
}

function openNewSession(dayId: string, account: AccountId) {
  const session = emptySession(account)
  emit('upsertSession', dayId, session)
  openEditor(dayId, session)
}

function closeEditor() {
  editorOpen.value = false
}

function syncEditorDialog(open: boolean) {
  const element = editorDialog.value
  if (!element) return
  if (open && !element.open) element.showModal()
  if (!open && element.open) element.close()
}

watch(editorOpen, (open) => syncEditorDialog(open))

function parsedTarget(): number | null | 'invalid' {
  const text = draft.targetLevelText.trim()
  if (!text) return null
  if (!/^\d+$/.test(text)) return 'invalid'
  const level = Number(text)
  if (level < 1 || level > levelCap.value) return 'invalid'
  return level
}

const editorProblem = computed(() => {
  if (parsedTarget() === 'invalid') return tf('schedule.needLevel', { cap: levelCap.value })
  return ''
})

function saveEditor() {
  if (editorProblem.value) return
  const level = parsedTarget()
  emit('upsertSession', editorDayId.value, {
    id: draft.id,
    account: draft.account,
    characterId: draft.characterId || null,
    targetLevel: level === 'invalid' ? null : level,
    activity: draft.activity.trim().slice(0, 500),
  })
  closeEditor()
}

function removeEditingSession() {
  emit('removeSession', editorDayId.value, draft.id)
  closeEditor()
}
</script>

<template>
  <article class="schedule-page" data-testid="schedule-page">
    <header class="schedule-head">
      <button type="button" class="text-btn guide-back" data-testid="schedule-back" @click="emit('back')">
        {{ t('schedule.back') }}
      </button>
      <h2>{{ t('ui.schedule') }}</h2>
      <button type="button" class="text-btn" data-testid="add-day" @click="emit('addDay')">
        {{ t('schedule.addDay') }}
      </button>
    </header>

    <p v-if="!sortedDays.length" class="empty" data-testid="schedule-empty">{{ t('schedule.empty') }}</p>

    <div v-else class="schedule-timeline">
      <section v-for="day in sortedDays" :key="day.id" class="schedule-day" :data-testid="`schedule-day-${day.day}`">
        <header class="schedule-day-head">
          <h3>{{ tf('schedule.dayLabel', { day: day.day }) }}</h3>
          <button
            type="button"
            class="icon-button"
            :aria-label="t('schedule.removeDay')"
            data-testid="remove-day"
            @click="emit('removeDay', day.id)"
          >
            ×
          </button>
        </header>

        <div class="schedule-columns">
          <div v-for="account in ACCOUNT_IDS" :key="account" class="schedule-column">
            <header class="schedule-column-head">
              <span>{{ t(`account.${account}`) }}</span>
              <button
                type="button"
                class="text-btn schedule-add"
                :aria-label="t('schedule.addSession')"
                @click="openNewSession(day.id, account)"
              >
                +
              </button>
            </header>

            <button
              v-for="slot in slotsFor(day, account)"
              :key="slot.session.id"
              type="button"
              class="schedule-slot"
              :class="{ 'is-empty': slot.empty }"
              :data-testid="`session-${slot.session.id}`"
              @click="openEditor(day.id, slot.session)"
            >
              <template v-if="slot.character">
                <WowIcon
                  class="schedule-face"
                  :file="RACE_ICON[slot.character.race] ?? ''"
                  :label="t(`race.${slot.character.race}`)"
                />
                <WowIcon
                  class="schedule-face"
                  :file="CLASS_ICON[slot.character.classId] ?? ''"
                  :label="t(`class.${slot.character.classId}`)"
                />
              </template>
              <span class="schedule-slot-text">
                <strong>{{ slot.label }}</strong>
                <span v-if="slot.session.targetLevel != null">
                  {{ tf('schedule.targetLevel', { level: slot.session.targetLevel }) }}
                </span>
                <span v-if="slot.session.activity.trim()" class="schedule-activity">
                  {{ slot.session.activity.trim() }}
                </span>
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>

    <dialog ref="editorDialog" class="sheet" data-testid="session-dialog" @close="closeEditor">
      <form @submit.prevent="saveEditor">
        <header class="sheet-head">
          <h2>{{ t(`account.${draft.account}`) }}</h2>
          <button type="button" class="icon-button" :aria-label="t('ui.close')" @click="closeEditor">×</button>
        </header>
        <div class="sheet-body">
          <div class="line">
            <span>{{ t('schedule.character') }}</span>
            <Dropdown
              :model-value="draft.characterId"
              :options="characterOptions"
              :label="t('schedule.character')"
              testid="session-character"
              @update:model-value="draft.characterId = $event"
            />
          </div>
          <label class="line">
            <span>{{ t('schedule.target') }}</span>
            <input
              v-model="draft.targetLevelText"
              inputmode="numeric"
              :placeholder="`1–${levelCap}`"
              data-testid="session-level"
            />
          </label>
          <label class="line">
            <span>{{ t('schedule.activity') }}</span>
            <textarea
              v-model="draft.activity"
              maxlength="500"
              rows="2"
              :placeholder="t('schedule.activityPlaceholder')"
              data-testid="session-activity"
            />
          </label>
        </div>
        <footer class="sheet-foot">
          <p v-if="editorProblem" class="problem">{{ editorProblem }}</p>
          <div class="foot-actions">
            <button type="button" class="text-btn danger-text" @click="removeEditingSession">
              {{ t('schedule.removeSession') }}
            </button>
            <button type="button" class="text-btn" @click="closeEditor">{{ t('ui.cancel') }}</button>
            <button type="submit" class="primary" data-testid="save-session">{{ t('ui.save') }}</button>
          </div>
        </footer>
      </form>
    </dialog>
  </article>
</template>
