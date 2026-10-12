<script setup lang="ts">
import { ref, watch } from 'vue'
import { iconUrl } from '../icons'

const props = defineProps<{ file: string; label: string }>()
const broken = ref(false)

watch(
  () => props.file,
  () => {
    broken.value = false
  },
)
</script>

<template>
  <img v-if="file && !broken" :src="iconUrl(file)" alt="" @error="broken = true" />
  <span v-else class="icon-fallback">{{ label.slice(0, 1) }}</span>
</template>
