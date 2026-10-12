<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'

const props = defineProps<{
  modelValue: string
  options: { value: string; label: string }[]
  label: string
  testid?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const menu = ref<HTMLElement | null>(null)
const portal = ref<HTMLElement | null>(null)
const style = ref<Record<string, string>>({})
let scrollParent: HTMLElement | null = null

const current = computed(() => props.options.find((option) => option.value === props.modelValue)?.label ?? '')

function place() {
  const el = root.value
  const node = menu.value
  const host = portal.value
  if (!el || !node || !host) return
  const rect = el.getBoundingClientRect()
  const menuRect = node.getBoundingClientRect()
  const bounds = host === document.body
    ? { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight }
    : host.getBoundingClientRect()
  const limitLeft = Math.max(8, bounds.left + 8)
  const limitRight = Math.min(window.innerWidth - 8, bounds.right - 8)
  const limitTop = Math.max(8, bounds.top + 8)
  const limitBottom = Math.min(window.innerHeight - 8, bounds.bottom - 8)
  let left = Math.max(limitLeft, Math.min(rect.left, limitRight - menuRect.width))
  let top = rect.bottom + 4
  if (top + menuRect.height > limitBottom) top = Math.max(limitTop, rect.top - menuRect.height - 4)
  style.value = {
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`,
    minWidth: `${Math.round(Math.max(rect.width, 176))}px`,
    visibility: 'visible',
  }
}

async function toggle() {
  if (open.value) {
    close()
    return
  }
  const el = root.value
  if (!el) return
  const dialog = el.closest('dialog')
  portal.value = dialog instanceof HTMLElement ? dialog : document.body
  style.value = { top: '0px', left: '0px', visibility: 'hidden' }
  open.value = true
  await nextTick()
  place()
  scrollParent = el.closest('.sheet-body')
  scrollParent?.addEventListener('scroll', place, { passive: true })
  window.addEventListener('resize', place)
  document.addEventListener('pointerdown', onPointer, true)
}

function close() {
  open.value = false
  scrollParent?.removeEventListener('scroll', place)
  window.removeEventListener('resize', place)
  document.removeEventListener('pointerdown', onPointer, true)
  scrollParent = null
}

function onPointer(event: PointerEvent) {
  const target = event.target
  if (!(target instanceof Node)) return
  if (root.value?.contains(target) || menu.value?.contains(target)) return
  close()
}

function choose(value: string) {
  emit('update:modelValue', value)
  close()
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

onBeforeUnmount(close)
</script>

<template>
  <div ref="root" class="dropdown" @keydown="onKey">
    <button
      type="button"
      class="dropdown-btn"
      :aria-label="label"
      :aria-expanded="open"
      aria-haspopup="listbox"
      :data-testid="testid"
      @click="toggle"
    >
      <span>{{ current }}</span>
    </button>
    <Teleport v-if="open && portal" :to="portal">
      <ul ref="menu" class="dropdown-menu" role="listbox" :style="style">
        <li v-for="option in options" :key="option.value">
          <button
            type="button"
            role="option"
            :aria-selected="option.value === modelValue"
            @click="choose(option.value)"
          >
            {{ option.label }}
          </button>
        </li>
      </ul>
    </Teleport>
  </div>
</template>
