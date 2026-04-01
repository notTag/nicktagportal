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

const gap = 4
const singleSetWidth = computed(
  () => props.skills.length * (props.diamondSize + gap),
)
const minWidth =
  typeof window !== 'undefined' ? window.innerWidth * 2 : 2560
const repeatCount = computed(
  () => Math.ceil(minWidth / singleSetWidth.value) + 1,
)
const duplicatedSkills = computed(() => {
  const result: Skill[] = []
  for (let i = 0; i < repeatCount.value; i++) {
    result.push(...props.skills)
  }
  return result
})

const duration = computed(() => singleSetWidth.value / props.speed)

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
    class="relative overflow-hidden"
    :class="{ paused: isPaused }"
    :style="{
      height: `${diamondSize + 8}px`,
      marginLeft: rowIndex % 2 === 1 ? `${-(diamondSize / 2)}px` : '0',
    }"
    @mouseenter="isPaused = true"
    @mouseleave="handleRowLeave"
  >
    <div
      class="flex shrink-0 items-center gap-1"
      :class="{ 'scroll-row-animation': isEntranceComplete }"
      :style="{ animationDuration: `${duration}s` }"
    >
      <SkillDiamond
        v-for="(skill, i) in duplicatedSkills"
        :key="`${skill.name}-${rowIndex}-${i}`"
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
    transform: translateX(-50%);
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
