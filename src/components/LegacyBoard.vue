<script setup lang="ts">
import { computed } from 'vue'
import { CLASS_COLOR } from '../data'
import { tf, t } from '../i18n'
import { CLASS_ICON, professionIcon } from '../icons'
import {
  challengesBy,
  LEGACY_CHALLENGES,
  LEGACY_GOAL,
  LEGACY_REWARDS,
  LEGACY_TOTAL,
  legacyCapacity,
  SIDE_GROUPS,
  tracks,
  type LegacyCategory,
  type LegacyChallenge,
} from '../legacy'
import type { Character } from '../types'
import HoverTip from './HoverTip.vue'
import WowIcon from './WowIcon.vue'

const props = defineProps<{ characters: Character[]; earned: string[] }>()
const emit = defineEmits<{ toggle: [id: string] }>()

const classRows = tracks('class')
const professionRows = tracks('profession')

const earnedSet = computed(() => new Set(props.earned))
const openSet = computed(() => legacyCapacity(props.characters))
const livingCount = computed(() => props.characters.filter((character) => character.status !== 'dead').length)
const possible = computed(() => openSet.value.size)
const earnedCount = computed(
  () => LEGACY_CHALLENGES.filter((challenge) => openSet.value.has(challenge.id) && earnedSet.value.has(challenge.id)).length,
)
const gap = computed(() => Math.max(0, LEGACY_GOAL - possible.value))
const remaining = computed(() => Math.max(0, LEGACY_GOAL - earnedCount.value))
const nextReward = computed(() => LEGACY_REWARDS.find((reward) => reward.points > earnedCount.value) ?? null)
const nextReachable = computed(() => nextReward.value != null && nextReward.value.points <= possible.value)
const fill = computed(() => `${(earnedCount.value / LEGACY_TOTAL) * 100}%`)
const reach = computed(() => `${(possible.value / LEGACY_TOTAL) * 100}%`)

const classBest = computed(() => {
  const map = new Map<string, Character>()
  for (const character of props.characters) {
    if (character.status === 'dead') continue
    const current = map.get(character.classId)
    if (!current || higher(character, current)) map.set(character.classId, character)
  }
  return map
})

const professionHolders = computed(() => {
  const map = new Map<string, string[]>()
  for (const character of props.characters) {
    if (character.status === 'dead') continue
    for (const id of character.primaries) {
      const names = map.get(id) ?? []
      names.push(character.name)
      map.set(id, names)
    }
  }
  return map
})

const visibleClassRows = computed(() => classRows.filter((row) => classBest.value.has(row.subject)))
const visibleProfessionRows = computed(() =>
  professionRows.filter((row) => (professionHolders.value.get(row.subject)?.length ?? 0) > 0),
)

function higher(candidate: Character, current: Character) {
  const level = candidate.level ?? -1
  const currentLevel = current.level ?? -1
  if (level !== currentLevel) return level > currentLevel
  return candidate.updatedAt > current.updatedAt
}

function has(id: string) {
  return earnedSet.value.has(id)
}

function isOpen(step: LegacyChallenge) {
  return openSet.value.has(step.id)
}

function marked(step: LegacyChallenge) {
  return isOpen(step) && has(step.id)
}

function score(category: LegacyCategory) {
  const openItems = challengesBy(category).filter((item) => openSet.value.has(item.id))
  if (!openItems.length) return t('legacy.unavailable')
  const got = openItems.filter((item) => earnedSet.value.has(item.id)).length
  return tf('legacy.count', { earned: got, total: openItems.length })
}

function markLeft(points: number) {
  return `${(points / LEGACY_TOTAL) * 100}%`
}

function classHint(subject: string) {
  const character = classBest.value.get(subject)
  if (!character) return t('legacy.noClass')
  if (character.level == null) return character.name
  return tf('legacy.rosterAt', {
    name: character.name,
    level: character.level,
    unit: t('ui.levelShort'),
  })
}

function profHint(subject: string) {
  const names = professionHolders.value.get(subject)
  if (!names?.length) return t('legacy.noProf')
  return names.join(', ')
}

function rosterCovers(step: LegacyChallenge) {
  if (!isOpen(step) || step.category !== 'class' || step.threshold == null || !step.subject || marked(step)) return false
  const level = classBest.value.get(step.subject)?.level
  return level != null && level >= step.threshold
}

function tipTitle(step: LegacyChallenge) {
  if (step.category === 'class' && step.subject && step.threshold != null) {
    return tf('legacy.classDetail', { name: t(`class.${step.subject}`), level: step.threshold })
  }
  if (step.category === 'profession' && step.subject && step.threshold != null) {
    return tf('legacy.profDetail', { name: t(`profession.${step.subject}`), skill: step.threshold })
  }
  return t(`legacy.short.${step.id}`)
}

function tipDetail(step: LegacyChallenge) {
  if (step.category === 'class' || step.category === 'profession') return ''
  return t(`legacy.detail.${step.id}`)
}

function tipLabel(step: LegacyChallenge) {
  const parts = [tipTitle(step)]
  const detail = tipDetail(step)
  if (detail) parts.push(detail)
  if (rosterCovers(step)) parts.push(t('legacy.covered'))
  return parts.join(' ')
}
</script>

<template>
  <section class="legacy" :aria-label="t('legacy.title')" data-testid="legacy-board">
    <header class="legacy-head">
      <h2>{{ t('legacy.title') }}</h2>
      <p class="legacy-score">
        <span>{{ t('legacy.possible') }} <strong data-testid="legacy-possible">{{ possible }}</strong></span>
        <span>{{ t('legacy.earned') }} <strong data-testid="legacy-earned">{{ earnedCount }}</strong></span>
        <span v-if="livingCount && gap === 0">{{ t('legacy.remaining') }} <strong data-testid="legacy-remaining" :class="{ 'is-goal': remaining === 0 }">{{ remaining }}</strong></span>
      </p>
    </header>

    <div class="legacy-track">
      <div
        class="legacy-bar"
        role="progressbar"
        :aria-valuemin="0"
        :aria-valuemax="LEGACY_TOTAL"
        :aria-valuenow="earnedCount"
        :aria-valuetext="tf('legacy.progress', { earned: earnedCount, possible, goal: LEGACY_GOAL })"
      >
        <span class="legacy-reach" :style="{ width: reach }" />
        <span class="legacy-fill" :style="{ width: fill }" />
        <span
          v-for="reward in LEGACY_REWARDS"
          :key="reward.id"
          class="legacy-mark"
          :class="{ reached: earnedCount >= reward.points, goal: reward.id === 'mount' }"
          :style="{ left: markLeft(reward.points) }"
          :title="t(`legacy.reward.${reward.id}`)"
        >
          <span>{{ reward.points }}</span>
        </span>
      </div>
      <p v-if="!livingCount" class="legacy-next" data-testid="legacy-next">{{ t('legacy.noRoster') }}</p>
      <template v-else>
        <p v-if="gap > 0" class="legacy-next" data-testid="legacy-gap">
          {{ tf('legacy.shortfall', { possible, gap }) }}
        </p>
        <p v-if="nextReachable && nextReward" class="legacy-next" data-testid="legacy-next">
          {{ tf('legacy.next', { name: t(`legacy.reward.${nextReward.id}`), left: nextReward.points - earnedCount }) }}
        </p>
        <p v-else-if="!nextReward" class="legacy-next" data-testid="legacy-next">{{ t('legacy.mounted') }}</p>
      </template>
    </div>

    <div v-if="visibleClassRows.length || visibleProfessionRows.length" class="legacy-columns">
      <div v-if="visibleClassRows.length">
        <p class="legacy-group-title">
          <span>{{ t('legacy.group.class') }}</span>
          <span data-testid="legacy-score-class">{{ score('class') }}</span>
        </p>
        <div v-for="row in visibleClassRows" :key="row.subject" class="legacy-row">
          <WowIcon class="legacy-face" :file="CLASS_ICON[row.subject] ?? ''" :label="t(`class.${row.subject}`)" />
          <div class="legacy-who">
            <strong class="legacy-label" :style="{ boxShadow: `inset 0 -2px 0 ${CLASS_COLOR[row.subject] ?? 'var(--gold)'}` }">
              {{ t(`class.${row.subject}`) }}
            </strong>
            <span>{{ classHint(row.subject) }}</span>
          </div>
          <div class="legacy-cells">
            <HoverTip v-for="step in row.steps" :key="step.id">
              <button
                type="button"
                class="legacy-cell"
                :class="{ on: marked(step), covered: rosterCovers(step) }"
                :aria-pressed="marked(step)"
                :aria-label="tipLabel(step)"
                :data-testid="`legacy-${step.id}`"
                @click="emit('toggle', step.id)"
              >
                {{ step.threshold }}
              </button>
              <template #tip>
                <strong>{{ tipTitle(step) }}</strong>
                <p v-if="rosterCovers(step)" class="legacy-tip">{{ t('legacy.covered') }}</p>
              </template>
            </HoverTip>
          </div>
        </div>
      </div>

      <div v-if="visibleProfessionRows.length">
        <p class="legacy-group-title">
          <span>{{ t('legacy.group.profession') }}</span>
          <span data-testid="legacy-score-profession">{{ score('profession') }}</span>
        </p>
        <div v-for="row in visibleProfessionRows" :key="row.subject" class="legacy-row">
          <WowIcon class="legacy-face" :file="professionIcon(row.subject)" :label="t(`profession.${row.subject}`)" />
          <div class="legacy-who">
            <strong>{{ t(`profession.${row.subject}`) }}</strong>
            <span>{{ profHint(row.subject) }}</span>
          </div>
          <div class="legacy-cells">
            <HoverTip v-for="step in row.steps" :key="step.id">
              <button
                type="button"
                class="legacy-cell"
                :class="{ on: marked(step) }"
                :aria-pressed="marked(step)"
                :aria-label="tipLabel(step)"
                :data-testid="`legacy-${step.id}`"
                @click="emit('toggle', step.id)"
              >
                {{ step.threshold }}
              </button>
              <template #tip>
                <strong>{{ tipTitle(step) }}</strong>
              </template>
            </HoverTip>
          </div>
        </div>
      </div>
    </div>

    <div v-if="livingCount" class="legacy-piles">
      <div v-for="category in SIDE_GROUPS" :key="category">
        <p class="legacy-group-title">
          <span>{{ t(`legacy.group.${category}`) }}</span>
          <span :data-testid="`legacy-score-${category}`">{{ score(category) }}</span>
        </p>
        <div class="legacy-wrap">
          <HoverTip v-for="step in challengesBy(category)" :key="step.id">
            <button
              type="button"
              class="legacy-cell"
              :class="{ on: marked(step) }"
              :aria-pressed="marked(step)"
              :aria-label="tipLabel(step)"
              :data-testid="`legacy-${step.id}`"
              @click="emit('toggle', step.id)"
            >
              {{ t(`legacy.short.${step.id}`) }}
            </button>
            <template #tip>
              <strong>{{ t(`legacy.short.${step.id}`) }}</strong>
              <p class="legacy-tip">{{ t(`legacy.detail.${step.id}`) }}</p>
            </template>
          </HoverTip>
        </div>
      </div>
    </div>
  </section>
</template>
