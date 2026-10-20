<script setup lang="ts">
import { computed } from 'vue'
import { guideBundles } from '../guideCopy'
import { chooseProfessionsGuide, classGuide, levelingGuide, professionGuide } from '../guides'
import { locale, tf, t } from '../i18n'
import { CLASS_ICON, professionIcon, RACE_ICON } from '../icons'
import { characterName, type Character } from '../types'
import WowIcon from './WowIcon.vue'

const props = defineProps<{ character: Character | null }>()
const emit = defineEmits<{ back: [] }>()

const bundle = computed(() => guideBundles[locale.value])
const classText = computed(() => (props.character ? bundle.value.classes[props.character.classId] : undefined))
const route = computed(() => (props.character ? bundle.value.routes[props.character.faction] : []))
const skyborne = computed(() => (props.character?.race.startsWith('skyborne') ? bundle.value.skyborne : ''))
const classHref = computed(() => (props.character ? classGuide(props.character.classId) : null))
const zoneHref = levelingGuide()
const professionLinks = computed(() => {
  const character = props.character
  if (!character) return []
  const links: { id: string; href: string; points: string[] }[] = []
  for (const id of [...character.primaries, ...character.secondaries]) {
    const href = professionGuide(id)
    const points = bundle.value.professions[id]?.points
    if (href && points) links.push({ id, href, points })
  }
  return links
})
const pairText = computed(() => (props.character ? bundle.value.pairs[props.character.classId] : ''))
</script>

<template>
  <article class="guide-page" data-testid="guide-page">
    <button type="button" class="text-btn guide-back" data-testid="guide-back" @click="emit('back')">
      {{ t('guide.back') }}
    </button>

    <p v-if="!character" class="empty guide-panel" data-testid="guide-missing">{{ t('guide.missing') }}</p>

    <template v-else>
      <header class="guide-panel guide-hero">
        <div class="guide-head">
          <WowIcon class="card-icon" :file="RACE_ICON[character.race] ?? ''" :label="t(`race.${character.race}`)" />
          <WowIcon class="card-icon" :file="CLASS_ICON[character.classId] ?? ''" :label="t(`class.${character.classId}`)" />
          <div class="card-title">
            <h2>{{ characterName(character) }}</h2>
            <p>
              {{ t(`race.${character.race}`) }} · {{ t(`class.${character.classId}`) }} · {{ t(`spec.${character.spec}`) }}
              · {{ t(`faction.${character.faction}`) }}
              <template v-if="character.level != null"> · {{ t('ui.levelShort') }} {{ character.level }}</template>
            </p>
          </div>
        </div>
      </header>

      <section class="guide-panel" data-testid="guide-leveling-body">
        <h3 class="guide-title">{{ t('guide.leveling') }}</h3>
        <div class="guide-cards">
          <div v-if="classText" class="guide-card">
            <h4>{{ t(`class.${character.classId}`) }}</h4>
            <p class="guide-spec">{{ classText.spec }}</p>
            <ul class="guide-points">
              <li v-for="point in classText.points" :key="point">{{ point }}</li>
            </ul>
            <a v-if="classHref" class="guide-external" :href="classHref" target="_blank" rel="noopener noreferrer" data-testid="guide-class">
              {{ tf('guide.classLink', { name: t(`class.${character.classId}`) }) }}
            </a>
          </div>
          <div class="guide-card">
            <h4>{{ t('guide.routeTitle') }}</h4>
            <p v-if="skyborne" class="guide-spec">{{ skyborne }}</p>
            <ul class="guide-route">
              <li v-for="step in route" :key="step.range">
                <span class="guide-range">{{ step.range }}</span>
                <span>{{ step.text }}</span>
              </li>
            </ul>
            <a class="guide-external" :href="zoneHref" target="_blank" rel="noopener noreferrer" data-testid="guide-leveling">
              {{ tf('guide.routeLink', { faction: t(`faction.${character.faction}`) }) }}
            </a>
          </div>
        </div>
      </section>

      <section class="guide-panel">
        <h3 class="guide-title">{{ t('guide.professions') }}</h3>
        <div class="guide-cards">
          <div v-for="link in professionLinks" :key="link.id" class="guide-card" :data-testid="`guide-prof-${link.id}`">
            <div class="guide-prof-head">
              <WowIcon class="guide-prof" :file="professionIcon(link.id)" :label="t(`profession.${link.id}`)" />
              <h4>{{ t(`profession.${link.id}`) }}</h4>
            </div>
            <ul class="guide-points">
              <li v-for="point in link.points" :key="point">{{ point }}</li>
            </ul>
            <a class="guide-external" :href="link.href" target="_blank" rel="noopener noreferrer">
              {{ tf('guide.profLink', { name: t(`profession.${link.id}`) }) }}
            </a>
          </div>
          <div v-if="!professionLinks.length" class="guide-card" data-testid="guide-choose">
            <h4>{{ t('guide.chooseTitle') }}</h4>
            <p class="guide-spec">{{ pairText }}</p>
            <a class="guide-external" :href="chooseProfessionsGuide()" target="_blank" rel="noopener noreferrer">{{ t('guide.chooseLink') }}</a>
          </div>
        </div>
      </section>

      <p class="guide-source">{{ t('guide.source') }}</p>
    </template>
  </article>
</template>
