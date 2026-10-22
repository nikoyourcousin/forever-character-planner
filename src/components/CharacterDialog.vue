<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import HoverTip from './HoverTip.vue'
import IconButton from './IconButton.vue'
import Dropdown from './Dropdown.vue'
import { classesFor, getRules, racesFor, SERVER_IDS, specsFor, STATUS_IDS } from '../data'
import { CLASS_ICON, FACTION_ICON, professionIcon, RACE_ICON } from '../icons'
import { t } from '../i18n'
import { newId } from '../storage'
import { ACCOUNT_IDS, type AccountId, type Character, type Faction, type Server, type Status } from '../types'

const props = defineProps<{
  open: boolean
  character: Character | null
  mainTaken: Record<Faction, boolean>
}>()

const emit = defineEmits<{
  close: []
  save: [character: Character]
}>()

const dialog = ref<HTMLDialogElement | null>(null)
const extrasOpen = ref(false)
const attempted = ref(false)

interface Draft {
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
  levelText: string
  server: Server | ''
  account: AccountId | ''
  status: Status
  notes: string
}

function emptyDraft(): Draft {
  return {
    id: newId(),
    name: '',
    surname: '',
    faction: 'alliance',
    race: '',
    classId: '',
    spec: '',
    primaries: [],
    secondaries: [],
    roles: [],
    levelText: '',
    server: '',
    account: '',
    status: 'idea',
    notes: '',
  }
}

function fromCharacter(character: Character): Draft {
  return {
    id: character.id,
    name: character.name,
    surname: character.surname,
    faction: character.faction,
    race: character.race,
    classId: character.classId,
    spec: character.spec,
    primaries: [...character.primaries],
    secondaries: [...character.secondaries],
    roles: [...character.roles],
    levelText: character.level == null ? '' : String(character.level),
    server: character.server,
    account: character.account,
    status: character.status,
    notes: character.notes,
  }
}

const draft = reactive<Draft>(emptyDraft())

const rules = computed(() => getRules())
const raceOptions = computed(() => racesFor(draft.faction))
const classOptions = computed(() => classesFor(draft.race))
const specOptions = computed(() => specsFor(draft.classId))
const serverOptions = computed(() => [
  { value: '', label: t('ui.serverNone') },
  ...SERVER_IDS.map((id) => ({ value: id, label: t(`server.${id}`) })),
])
const accountOptions = computed(() => [
  { value: '', label: t('ui.accountNone') },
  ...ACCOUNT_IDS.map((id) => ({ value: id, label: t(`account.${id}`) })),
])
const statusOptions = computed(() => STATUS_IDS.map((status) => ({ value: status, label: t(`status.${status}`) })))

function setServer(value: string) {
  draft.server = (SERVER_IDS as readonly string[]).includes(value) ? (value as Server) : ''
}

function setAccount(value: string) {
  draft.account = (ACCOUNT_IDS as readonly string[]).includes(value) ? (value as AccountId) : ''
}

function setStatus(value: string) {
  draft.status = (STATUS_IDS as readonly string[]).includes(value) ? (value as Status) : 'idea'
}

function sanitize() {
  if (!raceOptions.value.some((entry) => entry.id === draft.race)) {
    draft.race = ''
    draft.classId = ''
    draft.spec = ''
  }
  if (!classOptions.value.includes(draft.classId)) {
    draft.classId = ''
    draft.spec = ''
  }
  if (!specOptions.value.includes(draft.spec)) draft.spec = ''
  draft.primaries = draft.primaries.filter((id) => rules.value.primaryProfessions.includes(id)).slice(0, 2)
  draft.secondaries = draft.secondaries.filter((id) => rules.value.secondaryProfessions.includes(id))
  draft.roles = draft.roles.filter((id) => rules.value.roles.includes(id))
  const level = Number(draft.levelText)
  if (/^\d+$/.test(draft.levelText) && level > rules.value.levelCap) {
    draft.levelText = String(rules.value.levelCap)
  }
}

function parsedLevel(): number | null | 'invalid' {
  const text = draft.levelText.trim()
  if (!text) return null
  if (!/^\d+$/.test(text)) return 'invalid'
  const level = Number(text)
  if (level < 1 || level > rules.value.levelCap) return 'invalid'
  return level
}

const problem = computed(() => {
  if (draft.name.trim().length < 1 || draft.name.trim().length > 12) return t('ui.needName')
  if (draft.surname.trim().length > 12) return t('ui.needName')
  if (!draft.race) return t('ui.needRace')
  if (!draft.classId) return t('ui.needClass')
  if (!draft.spec) return t('ui.needSpec')
  if (parsedLevel() === 'invalid') return t('ui.needLevel').replace('{cap}', String(rules.value.levelCap))
  return ''
})

function load(character: Character | null) {
  attempted.value = false
  extrasOpen.value = Boolean(
    character && (character.notes || character.level != null || character.status !== 'idea'),
  )
  Object.assign(draft, character ? fromCharacter(character) : emptyDraft())
}

function setFaction(faction: Faction) {
  draft.faction = faction
  sanitize()
}

function setRace(raceId: string) {
  draft.race = raceId
  sanitize()
}

function setClass(classId: string) {
  draft.classId = classId
  sanitize()
  if (!draft.spec) draft.spec = specOptions.value[0] ?? ''
}

function mainLocked(role: string) {
  return role === 'main' && props.mainTaken[draft.faction] && !draft.roles.includes('main')
}

function toggle(list: string[], id: string, max?: number) {
  if (mainLocked(id)) return
  const index = list.indexOf(id)
  if (index >= 0) list.splice(index, 1)
  else if (max == null || list.length < max) list.push(id)
}

function submit() {
  attempted.value = true
  if (problem.value) return
  const level = parsedLevel()
  emit('save', {
    id: draft.id,
    name: draft.name.trim(),
    surname: draft.surname.trim(),
    faction: draft.faction,
    race: draft.race,
    classId: draft.classId,
    spec: draft.spec,
    primaries: [...draft.primaries],
    secondaries: [...draft.secondaries],
    roles: [...draft.roles],
    level: level === 'invalid' ? null : level,
    server: draft.server,
    account: draft.account,
    status: draft.status,
    notes: draft.notes.trim(),
    updatedAt: Date.now(),
  })
}

function syncDialog(open: boolean) {
  const element = dialog.value
  if (!element) return
  if (open && !element.open) element.showModal()
  if (!open && element.open) element.close()
}

watch(
  () => props.open,
  (open) => {
    if (open) load(props.character)
    syncDialog(open)
  },
)

function onDialogClose() {
  if (props.open) emit('close')
}
</script>

<template>
  <dialog ref="dialog" class="sheet" data-testid="character-dialog" @close="onDialogClose">
    <form @submit.prevent="submit">
      <header class="sheet-head">
        <h2>{{ character ? t('ui.editCharacter') : t('ui.newCharacter') }}</h2>
        <button type="button" class="icon-button" :aria-label="t('ui.close')" @click="emit('close')">×</button>
      </header>
      <div class="sheet-body">
        <div class="name-block">
          <span>{{ t('ui.name') }}</span>
          <div class="name-pair">
            <input
              v-model="draft.name"
              maxlength="12"
              required
              autocomplete="off"
              spellcheck="false"
              :placeholder="t('ui.name')"
              :aria-label="t('ui.name')"
              data-testid="name-input"
            />
            <input
              v-model="draft.surname"
              maxlength="12"
              autocomplete="off"
              spellcheck="false"
              :placeholder="t('ui.surname')"
              :aria-label="t('ui.surname')"
              data-testid="surname-input"
            />
          </div>
        </div>

        <div class="line">
          <span>{{ t('ui.server') }}</span>
          <Dropdown
            :model-value="draft.server"
            :options="serverOptions"
            :label="t('ui.server')"
            testid="server-select"
            @update:model-value="setServer"
          />
        </div>

        <div class="line">
          <span>{{ t('ui.account') }}</span>
          <Dropdown
            :model-value="draft.account"
            :options="accountOptions"
            :label="t('ui.account')"
            testid="account-select"
            @update:model-value="setAccount"
          />
        </div>

        <div class="line">
          <span>{{ t('ui.faction') }}</span>
          <div class="icon-row">
            <IconButton
              :file="FACTION_ICON.alliance"
              :label="t('faction.alliance')"
              :pressed="draft.faction === 'alliance'"
              testid="faction-alliance"
              @click="setFaction('alliance')"
            />
            <IconButton
              :file="FACTION_ICON.horde"
              :label="t('faction.horde')"
              :pressed="draft.faction === 'horde'"
              testid="faction-horde"
              @click="setFaction('horde')"
            />
          </div>
        </div>

        <div class="line">
          <span>{{ t('ui.race') }}</span>
          <div class="icon-row" data-testid="race-picker">
            <IconButton
              v-for="race in raceOptions"
              :key="race.id"
              :file="RACE_ICON[race.id] ?? ''"
              :label="t(`race.${race.id}`)"
              :pressed="draft.race === race.id"
              :testid="`race-${race.id}`"
              @click="setRace(race.id)"
            />
          </div>
        </div>

        <div v-if="draft.race" class="line">
          <span>{{ t('ui.class') }}</span>
          <div class="icon-row" data-testid="class-picker">
            <IconButton
              v-for="classId in classOptions"
              :key="classId"
              :file="CLASS_ICON[classId] ?? ''"
              :label="t(`class.${classId}`)"
              :pressed="draft.classId === classId"
              :testid="`class-${classId}`"
              @click="setClass(classId)"
            />
          </div>
        </div>

        <div v-if="draft.classId" class="line">
          <span>{{ t('ui.spec') }}</span>
          <div class="choice-row">
            <button
              v-for="spec in specOptions"
              :key="spec"
              type="button"
              class="choice"
              :aria-pressed="draft.spec === spec"
              :data-testid="`spec-${spec}`"
              @click="draft.spec = spec"
            >
              {{ t(`spec.${spec}`) }}
            </button>
          </div>
        </div>

        <div class="line">
          <span>{{ t('ui.roles') }}</span>
          <div class="choice-row">
            <HoverTip v-for="role in rules.roles" :key="role">
              <button
                type="button"
                class="choice"
                :aria-pressed="draft.roles.includes(role)"
                :disabled="mainLocked(role)"
                :data-testid="`role-${role}`"
                @click="toggle(draft.roles, role)"
              >
                {{ t(`role.${role}`) }}
              </button>
              <template v-if="mainLocked(role)" #tip>
                <strong>{{ t('ui.mainTaken') }}</strong>
              </template>
            </HoverTip>
          </div>
        </div>

        <div class="line">
          <span>{{ t('ui.primary') }} {{ draft.primaries.length }}/2</span>
          <div class="icon-row">
            <IconButton
              v-for="id in rules.primaryProfessions"
              :key="id"
              :file="professionIcon(id)"
              :label="t(`profession.${id}`)"
              :pressed="draft.primaries.includes(id)"
              :disabled="!draft.primaries.includes(id) && draft.primaries.length >= 2"
              :testid="`primary-${id}`"
              @click="toggle(draft.primaries, id, 2)"
            />
          </div>
        </div>

        <div class="line">
          <span>{{ t('ui.secondary') }}</span>
          <div class="icon-row">
            <IconButton
              v-for="id in rules.secondaryProfessions"
              :key="id"
              :file="professionIcon(id)"
              :label="t(`profession.${id}`)"
              :pressed="draft.secondaries.includes(id)"
              :testid="`secondary-${id}`"
              @click="toggle(draft.secondaries, id)"
            />
          </div>
        </div>

        <details :key="draft.id" class="more" :open="extrasOpen">
          <summary>{{ t('ui.details') }}</summary>
          <div class="form-grid">
            <label>
              <span>{{ t('ui.level') }}</span>
              <input v-model="draft.levelText" inputmode="numeric" :placeholder="`1–${rules.levelCap}`" data-testid="level-input" />
            </label>
            <label>
              <span>{{ t('ui.status') }}</span>
              <Dropdown
                :model-value="draft.status"
                :options="statusOptions"
                :label="t('ui.status')"
                testid="status-select"
                @update:model-value="setStatus"
              />
            </label>
            <label class="span-2">
              <span>{{ t('ui.notes') }}</span>
              <textarea v-model="draft.notes" maxlength="500" rows="2" data-testid="notes-input" />
            </label>
          </div>
        </details>
      </div>
      <footer class="sheet-foot">
        <p v-if="attempted && problem" class="problem">{{ problem }}</p>
        <div class="foot-actions">
          <button type="button" class="text-btn" @click="emit('close')">{{ t('ui.cancel') }}</button>
          <button type="submit" class="primary" data-testid="save-character">{{ t('ui.save') }}</button>
        </div>
      </footer>
    </form>
  </dialog>
</template>
