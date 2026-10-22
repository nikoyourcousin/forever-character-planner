<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { countdownParts, formatCountdown } from '../launch'
import { t } from '../i18n'

const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

const parts = computed(() => countdownParts(now.value))
const label = computed(() => (parts.value.live ? t('ui.live') : formatCountdown(parts.value)))

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (timer != null) clearInterval(timer)
})
</script>

<template>
  <p
    class="launch-countdown"
    :class="{ 'is-live': parts.live }"
    role="status"
    data-testid="launch-countdown"
    :title="parts.live ? t('ui.live') : t('ui.countdown')"
  >
    <template v-if="parts.live">{{ t('ui.live') }}</template>
    <template v-else>
      <span class="launch-countdown-label">{{ t('ui.countdown') }}</span>
      <strong>{{ label }}</strong>
    </template>
  </p>
</template>
