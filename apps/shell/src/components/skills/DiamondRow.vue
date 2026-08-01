<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { animate } from 'animejs'
import SkillDiamond from './SkillDiamond.vue'
import DiamondInfoPanel from './DiamondInfoPanel.vue'
import { prefersReducedMotion } from '@/utils/motion'
import type { Skill, ProficiencyMode } from '@/types/skills'

const props = defineProps<{
  skills: Skill[]
  speed: number
  rowIndex: number
  diamondSize: number
  mode: ProficiencyMode
  isEntranceComplete: boolean
}>()

const hoveredSkill = ref<Skill | null>(null)
const panelPosition = ref<{ x: number; y: number } | null>(null)
const trackRef = ref<HTMLElement | null>(null)

/** Outer cell is larger than the logo so hover lift and glow are not clipped */
const cellSize = computed(() => Math.ceil(props.diamondSize * 1.5))
const gap = 4

/**
 * Calculate how many copies of the skill set fill the viewport.
 * We create exactly 2 identical halves so translating by one half loops perfectly.
 */
const viewportWidth = ref(
  typeof window !== 'undefined' ? window.innerWidth : 1920,
)
function syncViewportWidth() {
  viewportWidth.value = window.innerWidth
}

const fillCount = computed(() =>
  Math.max(
    1,
    Math.ceil(
      viewportWidth.value / (props.skills.length * (cellSize.value + gap)),
    ),
  ),
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

const scrollDurationMs = computed(
  () => (scrollDistance.value / props.speed) * 1000,
)

/** Row height = cell bounding box + small vertical gap */
const rowHeight = computed(() => cellSize.value + gap)

/** Alternating row offset: half a cell width */
const rowOffset = computed(() =>
  props.rowIndex % 2 === 1 ? `${-(cellSize.value / 2)}px` : '0',
)

const SPEED_RAMP_DURATION_MS = 400

let scrollAnimation: ReturnType<typeof animate> | null = null
let speedRampAnimation: ReturnType<typeof animate> | null = null

/**
 * anime.js tweens this scalar and we write it through to the marquee's playback
 * rate, so hovering eases the row to a stop instead of freezing it mid-frame the
 * way `animation-play-state: paused` does.
 */
const marqueeSpeed = { current: 1 }

function startMarquee() {
  scrollAnimation?.revert()
  scrollAnimation = null

  if (!trackRef.value || prefersReducedMotion()) return

  scrollAnimation = animate(trackRef.value, {
    x: [0, -scrollDistance.value],
    duration: scrollDurationMs.value,
    ease: 'linear',
    loop: true,
  })
  scrollAnimation.speed = marqueeSpeed.current
}

function rampMarqueeSpeed(targetSpeed: number) {
  speedRampAnimation?.revert()
  if (!scrollAnimation) {
    marqueeSpeed.current = targetSpeed
    return
  }
  speedRampAnimation = animate(marqueeSpeed, {
    current: targetSpeed,
    duration: SPEED_RAMP_DURATION_MS,
    ease: 'outQuad',
    onUpdate: () => {
      if (scrollAnimation) scrollAnimation.speed = marqueeSpeed.current
    },
  })
}

// ponytail: resize restarts the marquee from x=0 rather than preserving
// progress. Resizes are rare and cell sizes shift anyway; add a seek() if the
// jump ever becomes noticeable.
watch(
  [scrollDistance, scrollDurationMs, () => props.isEntranceComplete],
  () => {
    if (props.isEntranceComplete) startMarquee()
  },
)

onMounted(() => {
  syncViewportWidth()
  window.addEventListener('resize', syncViewportWidth)
  if (props.isEntranceComplete) startMarquee()
})

onUnmounted(() => {
  window.removeEventListener('resize', syncViewportWidth)
  speedRampAnimation?.revert()
  scrollAnimation?.revert()
  speedRampAnimation = null
  scrollAnimation = null
})

function onDiamondHover(payload: { skill: Skill; element: HTMLElement }) {
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

function handleRowEnter() {
  rampMarqueeSpeed(0)
}

function handleRowLeave() {
  rampMarqueeSpeed(1)
  hoveredSkill.value = null
  panelPosition.value = null
}
</script>

<template>
  <div
    class="skill-row relative"
    :style="{
      height: `${rowHeight}px`,
      marginLeft: rowOffset,
    }"
    @mouseenter="handleRowEnter"
    @mouseleave="handleRowLeave"
  >
    <div
      ref="trackRef"
      class="flex shrink-0 items-center will-change-transform"
      :style="{ gap: `${gap}px` }"
    >
      <SkillDiamond
        v-for="(skill, i) in duplicatedSkills"
        :key="`${skill.name}-${props.rowIndex}-${i}`"
        :skill="skill"
        :mode="mode"
        :diamond-size="diamondSize"
        @hover="onDiamondHover($event)"
        @leave="onDiamondLeave"
      />
    </div>
  </div>

  <DiamondInfoPanel :skill="hoveredSkill" :position="panelPosition" />
</template>
