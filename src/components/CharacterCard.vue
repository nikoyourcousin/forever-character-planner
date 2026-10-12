<script setup lang="ts">
import { ref } from 'vue'
import WowIcon from './WowIcon.vue'
import { CLASS_COLOR } from '../data'
import { CLASS_ICON, professionIcon, RACE_ICON } from '../icons'
import { t } from '../i18n'
import { characterName, type Character } from '../types'

const props = defineProps<{ character: Character }>()

const emit = defineEmits<{
  edit: []
  duplicate: []
  remove: []
}>()

const confirming = ref(false)
const menuOpen = ref(false)

function closeMenu() {
  menuOpen.value = false
  confirming.value = false
}

function onFocusOut(event: FocusEvent) {
  const next = event.relatedTarget
  if (!(next instanceof Node) || !(event.currentTarget instanceof HTMLElement) || !event.currentTarget.contains(next)) {
    closeMenu()
  }
}

function askRemove() {
  if (!confirming.value) {
    confirming.value = true
    return
  }
  closeMenu()
  emit('remove')
}
</script>

<template>
  <article class="card" :class="{ 'is-dead': character.status === 'dead' }" data-testid="character-card" :data-name="characterName(character)">
    <div class="card-id">
      <WowIcon class="card-icon" :file="RACE_ICON[character.race] ?? ''" :label="t(`race.${character.race}`)" />
      <WowIcon
        class="card-icon"
        :file="CLASS_ICON[character.classId] ?? ''"
        :label="t(`class.${character.classId}`)"
        :style="{ boxShadow: `inset 0 -2px 0 ${CLASS_COLOR[character.classId] ?? '#e4c57a'}` }"
      />
      <div class="card-title">
        <h2>{{ characterName(props.character) }}</h2>
        <p>
          {{ t(`race.${character.race}`) }} · {{ t(`class.${character.classId}`) }} · {{ t(`spec.${character.spec}`) }}
          <template v-if="character.level"> · {{ t('ui.levelShort') }} {{ character.level }}</template>
        </p>
      </div>
    </div>
    <p class="roles">
      {{ character.roles.map((role) => t(`role.${role}`)).join(' · ') || '—' }}
      <span v-if="character.server" class="server-tag">{{ t(`server.${character.server}`) }}</span>
    </p>
    <div class="card-profs">
      <div v-if="character.primaries.length" class="prof-line">
        <WowIcon
          v-for="id in character.primaries"
          :key="id"
          class="card-prof is-primary"
          :file="professionIcon(id)"
          :label="t(`profession.${id}`)"
        />
      </div>
      <div v-if="character.secondaries.length" class="prof-line">
        <WowIcon
          v-for="id in character.secondaries"
          :key="id"
          class="card-prof"
          :file="professionIcon(id)"
          :label="t(`profession.${id}`)"
        />
      </div>
    </div>
    <div class="menu" :class="{ open: menuOpen }" @focusout="onFocusOut">
      <button
        type="button"
        class="menu-toggle"
        :aria-label="t('ui.actions')"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        …
      </button>
      <div v-if="menuOpen" class="menu-pop">
        <button type="button" @click="closeMenu(); emit('edit')">{{ t('ui.edit') }}</button>
        <button type="button" @click="closeMenu(); emit('duplicate')">{{ t('ui.duplicate') }}</button>
        <button type="button" class="danger" @click="askRemove">
          {{ confirming ? t('ui.confirmRemove') : t('ui.remove') }}
        </button>
      </div>
    </div>
    <p v-if="character.notes" class="notes">{{ character.notes }}</p>
  </article>
</template>
