<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useSlots } from 'vue'

const wrap = ref<HTMLElement | null>(null)
const tip = ref<HTMLElement | null>(null)
const shown = ref(false)
const portal = ref<HTMLElement | null>(null)
const style = ref<Record<string, string>>({})
const slots = useSlots()

let scrollParent: HTMLElement | null = null

function canHover() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

function place() {
  const el = wrap.value
  const node = tip.value
  const host = portal.value
  if (!el || !node || !host) return
  const rect = el.getBoundingClientRect()
  const tipRect = node.getBoundingClientRect()
  const bounds = host === document.body
    ? { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight }
    : host.getBoundingClientRect()
  const limitLeft = Math.max(8, bounds.left + 8)
  const limitRight = Math.min(window.innerWidth - 8, bounds.right - 8)
  const limitTop = Math.max(8, bounds.top + 8)
  const limitBottom = Math.min(window.innerHeight - 8, bounds.bottom - 8)
  let left = rect.left + rect.width / 2 - tipRect.width / 2
  left = Math.max(limitLeft, Math.min(left, limitRight - tipRect.width))
  let top = rect.bottom + 8
  if (top + tipRect.height > limitBottom) top = rect.top - tipRect.height - 8
  if (top < limitTop) top = limitTop
  style.value = {
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`,
    visibility: 'visible',
  }
}

async function show() {
  if (!canHover() || !slots.tip) return
  const el = wrap.value
  if (!el) return
  const dialog = el.closest('dialog')
  portal.value = dialog instanceof HTMLElement ? dialog : document.body
  const rect = el.getBoundingClientRect()
  style.value = {
    top: `${Math.round(rect.bottom + 8)}px`,
    left: `${Math.round(rect.left)}px`,
    visibility: 'hidden',
  }
  shown.value = true
  await nextTick()
  place()
  scrollParent = el.closest('.sheet-body')
  scrollParent?.addEventListener('scroll', place, { passive: true })
  window.addEventListener('resize', place)
}

function hide() {
  shown.value = false
  scrollParent?.removeEventListener('scroll', place)
  window.removeEventListener('resize', place)
  scrollParent = null
}

onBeforeUnmount(hide)
</script>

<template>
  <span ref="wrap" class="hover-host" @mouseenter="show" @mouseleave="hide">
    <slot />
    <Teleport v-if="shown && portal" :to="portal">
      <div ref="tip" class="float-tip is-label" :style="style" role="tooltip">
        <slot name="tip" />
      </div>
    </Teleport>
  </span>
</template>
