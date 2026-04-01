<script setup lang="ts">
import { ref, computed } from 'vue'
import SkillDiamond from './SkillDiamond.vue'
import DiamondInfoPanel from './DiamondInfoPanel.vue'
import type { Skill, ProficiencyMode } from '@/types/skills'

const props = defineProps<{
  skills: Skill[]
  speed: number
  rowIndex: number
  diamondSize: number
  mode: ProficiencyMode
  isEntranceComplete: boolean
}>()

const isPaused = ref(false)
const hoveredSkill = ref<Skill | null>(null)
const panelPosition = ref<{ x: number; y: number } | null>(null)

/** Cell size accounts for the rotated diamond's bounding box */
const cellSize = computed(() => Math.ceil(props.diamondSize * 1.5))
const gap = 4

/**
 * Calculate how many copies of the skill set fill the viewport.
 * We create exactly 2 identical halves so translateX(-50%) loops perfectly.
 */
const viewportWidth =
  typeof window !== 'undefined' ? window.innerWidth : 1920
const fillCount = computed(() =>
  Math.max(1, Math.ceil(viewportWidth / (props.skills.length * (cellSize.value + gap)))),
)
const oneHalf = computed(() => {
  const result: Skill[] = []
  for (let i = 0; i < fillCount.value; i++) {
    result.push(...props.skills)
  }
  return result
})
const duplicatedSkills = computed(() => [...oneHalf.value, ...oneHalf.value])

/** Pixel distance of exactly one half for seamless loop */
const scrollDistance = computed(
  () => oneHalf.value.length * (cellSize.value + gap),
)

const duration = computed(() => scrollDistance.value / props.speed)

/** Row height = cell bounding box + small vertical gap */
const rowHeight = computed(() => cellSize.value + gap)

/** Alternating row offset: half a cell width */
const rowOffset = computed(() =>
  props.rowIndex % 2 === 1 ? `${-(cellSize.value / 2)}px` : '0',
)

function onDiamondHover(
  payload: { skill: Skill; element: HTMLElement },
  _index: number,
) {
  hoveredSkill.value = payload.skill
  const rect = payload.element.getBoundingClientRect()
  panelPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.bottom + 8,
  }
}

function onDiamondLeave() {
  hoveredSkill.value = null
  panelPosition.value = null
}

function handleRowLeave() {
  isPaused.value = false
  hoveredSkill.value = null
  panelPosition.value = null
}
</script>

<template>
  <div
    class="relative"
    :class="{ paused: isPaused }"
    :style="{
      height: `${rowHeight}px`,
      marginLeft: rowOffset,
    }"
    @mouseenter="isPaused = true"
    @mouseleave="handleRowLeave"
  >
    <div
      class="flex shrink-0 items-center"
      :class="{ 'scroll-row-animation': isEntranceComplete }"
      :style="{
        animationDuration: `${duration}s`,
        gap: `${gap}px`,
        '--scroll-distance': `-${scrollDistance}px`,
      }"
    >
      <SkillDiamond
        v-for="(skill, i) in duplicatedSkills"
        :key="`${skill.name}-${props.rowIndex}-${i}`"
        :skill="skill"
        :mode="mode"
        :diamond-size="diamondSize"
        @hover="onDiamondHover($event, i)"
        @leave="onDiamondLeave"
      />
    </div>
  </div>

  <DiamondInfoPanel :skill="hoveredSkill" :position="panelPosition" />
</template>

<style scoped>
@keyframes scroll-row {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(var(--scroll-distance));
  }
}

.scroll-row-animation {
  animation: scroll-row linear infinite;
  will-change: transform;
}

.paused .scroll-row-animation {
  animation-play-state: paused;
}

@media (prefers-reduced-motion: reduce) {
  .scroll-row-animation {
    animation: none;
  }
}
</style>
