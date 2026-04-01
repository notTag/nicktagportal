<script setup lang="ts">
import type { Skill } from '@/types/skills'

defineProps<{
  skill: Skill | null
  position: { x: number; y: number } | null
}>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      enter-active-class="transition-all duration-150 ease-out delay-50"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      leave-active-class="transition-opacity duration-200 ease-in"
    >
      <div
        v-if="skill && position"
        role="tooltip"
        class="pointer-events-none fixed z-50 rounded-md border border-border bg-surface-raised px-4 py-3 shadow-lg"
        :style="{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translateX(-50%)',
        }"
      >
        <p class="text-base font-bold text-text">
          {{ skill.displayName }}
        </p>
        <p class="text-sm font-normal text-text-muted">
          {{ skill.years }} {{ skill.years === 1 ? 'year' : 'years' }}
          experience
        </p>
        <span class="mt-1 inline-block text-xs font-bold text-accent-cyan">
          {{ skill.category }}
        </span>
      </div>
    </Transition>
  </Teleport>
</template>
