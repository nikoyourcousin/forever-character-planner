<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import CharacterCard from './components/CharacterCard.vue'
import CharacterDialog from './components/CharacterDialog.vue'
import Dropdown from './components/Dropdown.vue'
import HoverTip from './components/HoverTip.vue'
import IconButton from './components/IconButton.vue'
import LegacyBoard from './components/LegacyBoard.vue'
import { useLegacy } from './composables/useLegacy'
import { useRoster } from './composables/useRoster'
import { ALL_ROLES } from './data'
import { locale, setLocale, t } from './i18n'
import { FACTION_ICON } from './icons'
// Покрытие профессий снято с экрана, код ниже оставлен.
// import WowIcon from './components/WowIcon.vue'
// import { getRules } from './data'
// import { CLASS_ICON, professionIcon, RACE_ICON } from './icons'
import { characterName, type Character, type Faction } from './types'
import { dayIndex, publicUrl, wallpaperSrc } from './wallpapers'

const { characters, notice, importedLegacy, dismissNotice, upsert, remove, duplicate, exportRoster, importText } = useRoster()
const { earned, toggle, replace } = useLegacy(() => {
  notice.value = t('ui.storageFailed')
})
// const rules = getRules()

const factionFilter = ref<'all' | Faction>('all')
const roleFilter = ref('all')
const query = ref('')

const editorOpen = ref(false)
const editing = ref<Character | null>(null)
const importOpen = ref(false)
const importDraft = ref('')
const importDialog = ref<HTMLDialogElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const wallpaperFiles = ref<string[]>([])
const wallpaper = computed(() => {
  const files = wallpaperFiles.value
  if (!files.length) return ''
  return wallpaperSrc(files[dayIndex(files.length)] ?? '')
})

onMounted(() => {
  void loadWallpapers()
})

async function loadWallpapers() {
  try {
    const response = await fetch(publicUrl('wallpapers.json'), { cache: 'no-store' })
    if (!response.ok) return
    const data: unknown = await response.json()
    if (!Array.isArray(data)) return
    wallpaperFiles.value = data.filter((item): item is string => typeof item === 'string' && item.length > 0)
  } catch {
    wallpaperFiles.value = []
  }
}

const roleOptions = computed(() => [
  { value: 'all', label: t('ui.anyRole') },
  ...ALL_ROLES.map((role) => ({ value: role, label: t(`role.${role}`) })),
])

const filtersActive = computed(
  () => factionFilter.value !== 'all' || roleFilter.value !== 'all' || query.value.trim() !== '',
)

function sortRoster(list: Character[]) {
  return [...list].sort((a, b) => {
    const deadRank = Number(a.status === 'dead') - Number(b.status === 'dead')
    if (deadRank !== 0) return deadRank
    const mainRank = Number(!a.roles.includes('main')) - Number(!b.roles.includes('main'))
    if (mainRank !== 0) return mainRank
    const roleRank = Number(a.roles.length === 0) - Number(b.roles.length === 0)
    if (roleRank !== 0) return roleRank
    return b.updatedAt - a.updatedAt
  })
}

const legacyRoster = computed(() =>
  factionFilter.value === 'all'
    ? characters.value
    : characters.value.filter((character) => character.faction === factionFilter.value),
)

const planned = computed(() =>
  sortRoster(
    characters.value.filter((character) => {
      if (factionFilter.value !== 'all' && character.faction !== factionFilter.value) return false
      if (roleFilter.value !== 'all' && !character.roles.includes(roleFilter.value)) return false
      return true
    }),
  ),
)

const visible = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()
  if (!needle) return planned.value
  return planned.value.filter((character) => {
    const text = [
      characterName(character),
      character.notes,
      character.server ? t(`server.${character.server}`) : '',
      t(`race.${character.race}`),
      t(`class.${character.classId}`),
      t(`spec.${character.spec}`),
      t(`faction.${character.faction}`),
      t(`status.${character.status}`),
      ...character.roles.map((role) => t(`role.${role}`)),
      ...character.primaries.map((id) => t(`profession.${id}`)),
      ...character.secondaries.map((id) => t(`profession.${id}`)),
    ]
      .join(' ')
      .toLocaleLowerCase()
    return text.includes(needle)
  })
})

const hover = ref<{ id: string; field: 'primaries' | 'secondaries' } | null>(null)

/*
const living = computed(() => characters.value.filter((character) => character.status !== 'dead'))
const factions = ['alliance', 'horde'] as const
const professionRows = [
  { field: 'primaries' as const, ids: rules.primaryProfessions },
  { field: 'secondaries' as const, ids: rules.secondaryProfessions },
]

const professionSplit = computed(() => {
  if (factionFilter.value !== 'all') return false
  const present = new Set(characters.value.map((character) => character.faction))
  return present.has('alliance') && present.has('horde')
})

function cover(id: string, field: 'primaries' | 'secondaries') {
  return {
    alliance: living.value.some((character) => character.faction === 'alliance' && character[field].includes(id)),
    horde: living.value.some((character) => character.faction === 'horde' && character[field].includes(id)),
  }
}

function heldInScope(id: string, field: 'primaries' | 'secondaries') {
  const sides = cover(id, field)
  if (factionFilter.value === 'alliance') return sides.alliance
  if (factionFilter.value === 'horde') return sides.horde
  return sides.alliance || sides.horde
}

function coverClass(id: string, field: 'primaries' | 'secondaries') {
  if (!professionSplit.value) return heldInScope(id, field) ? 'is-held' : 'is-none'
  const sides = cover(id, field)
  if (sides.alliance && sides.horde) return 'is-both'
  if (sides.alliance) return 'is-alliance'
  if (sides.horde) return 'is-horde'
  return 'is-none'
}

function professionPeople(id: string, field: 'primaries' | 'secondaries', faction?: Faction) {
  return sortRoster(
    characters.value.filter(
      (character) =>
        character[field].includes(id) &&
        (faction == null || character.faction === faction) &&
        (factionFilter.value === 'all' || character.faction === factionFilter.value),
    ),
  )
}
*/

function lacksHover(character: Character) {
  if (!hover.value) return false
  return !character[hover.value.field].includes(hover.value.id)
}

const mainTaken = computed(() => {
  const taken: Record<Faction, boolean> = { alliance: false, horde: false }
  for (const character of characters.value) {
    if (character.id === editing.value?.id || !character.roles.includes('main')) continue
    taken[character.faction] = true
  }
  return taken
})

function toggleFaction(faction: Faction) {
  factionFilter.value = factionFilter.value === faction ? 'all' : faction
}

function clearFilters() {
  factionFilter.value = 'all'
  roleFilter.value = 'all'
  query.value = ''
}

function openCreate() {
  editing.value = null
  editorOpen.value = true
}

function openEdit(character: Character) {
  editing.value = character
  editorOpen.value = true
}

function saveCharacter(character: Character) {
  upsert(character)
  editorOpen.value = false
}

function takeLegacy() {
  const marks = importedLegacy.value
  if (marks != null) replace(marks)
}

function syncImportDialog(open: boolean) {
  const element = importDialog.value
  if (!element) return
  if (open && !element.open) element.showModal()
  if (!open && element.open) element.close()
}

watch(importOpen, (open) => syncImportDialog(open))

function closeImport() {
  importOpen.value = false
}

async function onImportFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (importText(await file.text())) {
    takeLegacy()
    closeImport()
  }
}

function applyImportDraft() {
  if (importText(importDraft.value)) {
    takeLegacy()
    importDraft.value = ''
    closeImport()
  }
}

watchEffect(() => {
  document.title = `${t('ui.mark')} · ${t('ui.title')}`
})
</script>

<template>
  <div class="sky" :class="{ 'has-wallpaper': wallpaper }" :style="wallpaper ? { '--wallpaper': `url('${wallpaper}')` } : undefined">
    <div class="page">
      <header class="top">
        <div class="brand">
          <img class="forever-logo" :src="publicUrl('forever-logo.png')" alt="" />
          <div class="brand-text">
            <p class="eyebrow">{{ t('ui.eyebrow') }}</p>
            <h1>{{ t('ui.mark') }}</h1>
          </div>
        </div>
        <div class="top-actions">
          <div class="lang" role="group" :aria-label="t('ui.title')">
            <button type="button" :aria-pressed="locale === 'ru'" data-testid="lang-ru" @click="setLocale('ru')">RU</button>
            <button type="button" :aria-pressed="locale === 'en'" data-testid="lang-en" @click="setLocale('en')">EN</button>
          </div>
          <button type="button" class="text-btn" data-testid="export-roster" @click="exportRoster(earned)">{{ t('ui.export') }}</button>
          <button type="button" class="text-btn" data-testid="open-import" @click="dismissNotice(); importOpen = true">{{ t('ui.import') }}</button>
          <button type="button" class="primary" data-testid="new-character" @click="openCreate">{{ t('ui.newCharacter') }}</button>
        </div>
      </header>

      <p v-if="notice" class="banner" role="status">
        <span>{{ notice }}</span>
        <button type="button" class="icon-button" :aria-label="t('ui.close')" @click="dismissNotice">×</button>
      </p>

      <LegacyBoard :characters="legacyRoster" :earned="earned" @toggle="toggle" />

      <!--
      <section class="board" :aria-label="t('ui.board')">
        <div
          v-for="row in professionRows"
          :key="row.field"
          class="icon-strip"
          :class="{ secondary: row.field === 'secondaries' }"
        >
          <span
            v-for="id in row.ids"
            :key="id"
            class="strip-slot"
            :class="{ hot: hover?.id === id && hover.field === row.field }"
            @mouseenter="hover = { id, field: row.field }"
            @mouseleave="hover = null"
          >
            <span class="prof-stack" :class="[row.field === 'primaries' ? 'is-primary' : 'is-secondary', coverClass(id, row.field)]">
              <WowIcon class="prof-layer is-dim" :file="professionIcon(id)" :label="t(`profession.${id}`)" />
              <WowIcon
                v-if="!professionSplit && heldInScope(id, row.field)"
                class="prof-layer is-full"
                :file="professionIcon(id)"
                :label="t(`profession.${id}`)"
              />
              <WowIcon
                v-if="professionSplit && cover(id, row.field).alliance"
                class="prof-layer is-alliance"
                :file="professionIcon(id)"
                :label="t('faction.alliance')"
              />
              <WowIcon
                v-if="professionSplit && cover(id, row.field).horde"
                class="prof-layer is-horde"
                :file="professionIcon(id)"
                :label="t('faction.horde')"
              />
              <WowIcon
                v-if="professionSplit && cover(id, row.field).alliance"
                class="pip is-alliance"
                :file="FACTION_ICON.alliance"
                :label="t('faction.alliance')"
              />
              <WowIcon
                v-if="professionSplit && cover(id, row.field).horde"
                class="pip is-horde"
                :file="FACTION_ICON.horde"
                :label="t('faction.horde')"
              />
            </span>
            <div v-if="hover?.id === id && hover.field === row.field" class="float-tip" role="tooltip">
              <header>
                <WowIcon class="tip-prof" :file="professionIcon(id)" :label="t(`profession.${id}`)" />
                <strong>{{ t(`profession.${id}`) }}</strong>
              </header>
              <p v-if="!professionPeople(id, row.field).length" class="tip-empty">{{ t('ui.vacant') }}</p>
              <template v-else-if="professionSplit">
                <div v-for="faction in factions" :key="faction" class="tip-side">
                  <p class="tip-faction">
                    <WowIcon class="tip-mark" :file="FACTION_ICON[faction]" :label="t(`faction.${faction}`)" />
                    <span>{{ t(`faction.${faction}`) }}</span>
                  </p>
                  <p v-if="!professionPeople(id, row.field, faction).length" class="tip-empty">{{ t('ui.vacant') }}</p>
                  <ul v-else>
                    <li v-for="character in professionPeople(id, row.field, faction)" :key="character.id">
                      <WowIcon class="tip-face" :file="RACE_ICON[character.race] ?? ''" :label="t(`race.${character.race}`)" />
                      <WowIcon class="tip-face" :file="CLASS_ICON[character.classId] ?? ''" :label="t(`class.${character.classId}`)" />
                      <span>{{ characterName(character) }}</span>
                    </li>
                  </ul>
                </div>
              </template>
              <ul v-else>
                <li v-for="character in professionPeople(id, row.field)" :key="character.id">
                  <WowIcon class="tip-face" :file="RACE_ICON[character.race] ?? ''" :label="t(`race.${character.race}`)" />
                  <WowIcon class="tip-face" :file="CLASS_ICON[character.classId] ?? ''" :label="t(`class.${character.classId}`)" />
                  <span>{{ characterName(character) }}</span>
                </li>
              </ul>
            </div>
          </span>
        </div>
      </section>
      -->

      <section class="roster">
        <header class="roster-head">
          <h2>{{ t('ui.roster') }}</h2>
        </header>
        <div class="toolbar">
          <label class="search">
            <span class="sr-only">{{ t('ui.search') }}</span>
            <input v-model="query" type="search" :placeholder="t('ui.searchPlaceholder')" data-testid="search-input" />
          </label>
          <div class="faction-toggle" role="group" :aria-label="t('ui.faction')" data-testid="faction-filter">
            <IconButton
              :file="FACTION_ICON.alliance"
              :label="t('faction.alliance')"
              :pressed="factionFilter === 'alliance'"
              testid="filter-alliance"
              @click="toggleFaction('alliance')"
            />
            <IconButton
              :file="FACTION_ICON.horde"
              :label="t('faction.horde')"
              :pressed="factionFilter === 'horde'"
              testid="filter-horde"
              @click="toggleFaction('horde')"
            />
          </div>
          <Dropdown v-model="roleFilter" :label="t('ui.roles')" :options="roleOptions" testid="role-filter" />
          <HoverTip>
            <button
              type="button"
              class="clear-filters"
              :disabled="!filtersActive"
              :aria-label="t('ui.clearFilters')"
              data-testid="clear-filters"
              @click="clearFilters"
            >
              ×
            </button>
            <template v-if="filtersActive" #tip>
              <strong>{{ t('ui.clearFilters') }}</strong>
            </template>
          </HoverTip>
        </div>
        <div v-if="visible.length" class="grid">
          <CharacterCard
            v-for="character in visible"
            :key="character.id"
            :character="character"
            :class="{ 'is-aside': lacksHover(character) }"
            @edit="openEdit(character)"
            @duplicate="duplicate(character)"
            @remove="remove(character.id)"
          />
        </div>
        <p v-else class="empty">{{ characters.length ? t('ui.emptyFiltered') : t('ui.emptyText') }}</p>
      </section>

      <footer class="footnote">{{ t('ui.footnote') }}</footer>

      <CharacterDialog
        :open="editorOpen"
        :character="editing"
        :main-taken="mainTaken"
        @close="editorOpen = false"
        @save="saveCharacter"
      />

      <dialog ref="importDialog" class="sheet import-sheet" @close="importOpen = false">
        <form @submit.prevent="applyImportDraft">
          <header class="sheet-head">
            <h2>{{ t('ui.importTitle') }}</h2>
            <button type="button" class="icon-button" :aria-label="t('ui.close')" @click="closeImport">×</button>
          </header>
          <div class="sheet-body">
            <p class="field-hint">{{ t('ui.importHint') }}</p>
            <p v-if="notice" class="problem">{{ notice }}</p>
            <input ref="fileInput" class="sr-only" type="file" accept="application/json,.json" data-testid="import-file" @change="onImportFile" />
            <button type="button" class="text-btn" @click="fileInput?.click()">{{ t('ui.importFile') }}</button>
            <textarea v-model="importDraft" rows="8" :placeholder="t('ui.importPlaceholder')" data-testid="import-text" />
          </div>
          <footer class="sheet-foot">
            <div class="foot-actions">
              <button type="button" class="text-btn" @click="closeImport">{{ t('ui.cancel') }}</button>
              <button type="submit" class="primary" data-testid="import-apply">{{ t('ui.importApply') }}</button>
            </div>
          </footer>
        </form>
      </dialog>
    </div>
  </div>
</template>
