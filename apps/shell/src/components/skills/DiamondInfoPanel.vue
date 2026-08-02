<script setup lang="ts">
import { animate } from 'animejs'
import { formatYears } from '@/types/skills'
import type { Skill } from '@/types/skills'

defineProps<{
  skill: Skill | null
  position: { x: number; y: number } | null
}>()

/**
 * The outer element owns positioning (including the `translateX(-50%)` centring)
 * so anime.js can own `transform` on the inner card without the two fighting.
 */
function innerCard(el: Element): Element | null {
  return el.firstElementChild
}

function onEnter(el: Element, done: () => void) {
  const card = innerCard(el)
  if (!card) {
    done()
    return
  }
  animate(card, {
    opacity: [0, 1],
    translateY: [-6, 0],
    duration: 180,
    ease: 'outQuad',
    onComplete: done,
  })
}

function onLeave(el: Element, done: () => void) {
  const card = innerCard(el)
  if (!card) {
    done()
    return
  }
  animate(card, {
    opacity: 0,
    translateY: -4,
    duration: 140,
    ease: 'inQuad',
    onComplete: done,
  })
}
</script>

<template>
  <Teleport to="body">
    <Transition :css="false" @enter="onEnter" @leave="onLeave">
      <div
        v-if="skill && position"
        class="pointer-events-none fixed z-50"
        :style="{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translateX(-50%)',
        }"
      >
        <div
          role="tooltip"
          class="border-border bg-surface-raised rounded-md border px-4 py-3 shadow-lg"
        >
          <p class="text-text text-base font-bold">
            {{ skill.displayName }}
          </p>
          <p class="text-text-muted text-sm font-normal">
            {{ formatYears(skill.years) }}
            {{ skill.years === 1 ? 'year' : 'years' }}
            experience
          </p>
          <span class="text-accent-cyan mt-1 inline-block text-xs font-bold">
            {{ skill.category }}
          </span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
