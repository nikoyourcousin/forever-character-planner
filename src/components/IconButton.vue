<script setup lang="ts">
import HoverTip from './HoverTip.vue'
import WowIcon from './WowIcon.vue'

defineProps<{
  file: string
  label: string
  pressed?: boolean
  disabled?: boolean
  testid?: string
}>()

defineEmits<{ click: [] }>()
</script>

<template>
  <HoverTip>
    <button
      type="button"
      class="icon-btn"
      :class="{ on: pressed }"
      :aria-pressed="pressed"
      :aria-label="label"
      :disabled="disabled"
      :data-testid="testid"
      @click="$emit('click')"
    >
      <WowIcon :file="file" :label="label" />
    </button>
    <template #tip>
      <header>
        <WowIcon class="tip-prof" :file="file" :label="label" />
        <strong>{{ label }}</strong>
      </header>
    </template>
  </HoverTip>
</template>
