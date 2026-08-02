<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { animate, stagger, utils } from 'animejs'
import { useSkillsStore } from '@/stores/skills'
import { prefersReducedMotion } from '@/utils/motion'
import { cellSizeFor, LOGO_CELL_GAP_PX } from './layout'
import DiamondRow from './DiamondRow.vue'
import type { Skill } from '@/types/skills'
import techSkills from '@/data/techSkills.json'

const ROW_SPEEDS = [20, 30, 25, 35, 22, 28, 32, 24]

const store = useSkillsStore()
const isEntranceComplete = ref(false)
const wallRef = ref<HTMLElement | null>(null)

const diamondSize = ref(80)
const rowCount = ref(7)

const TOOLBAR_HEIGHT = 120

const ENTRANCE_DURATION_MS = 550
const ENTRANCE_ROW_STAGGER_MS = 80
const ENTRANCE_RISE_PX = 28

function updateResponsive() {
  const w = window.innerWidth
  const h = window.innerHeight

  if (w < 640) {
    diamondSize.value = 48
  } else if (w < 1024) {
    diamondSize.value = 56
  } else {
    diamondSize.value = 80
  }

  const cellHeight = cellSizeFor(diamondSize.value) + LOGO_CELL_GAP_PX
  const availableHeight = h - TOOLBAR_HEIGHT
  const dynamicRows = Math.ceil(availableHeight / cellHeight)

  if (w < 640) {
    rowCount.value = Math.max(5, dynamicRows)
  } else if (w < 1024) {
    rowCount.value = Math.max(6, dynamicRows)
  } else {
    rowCount.value = Math.max(7, dynamicRows)
  }
}

/** Seeded shuffle so each row gets a deterministic but varied order */
function shuffleWithSeed(arr: Skill[], seed: number): Skill[] {
  const result = [...arr]
  let s = seed
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647
    const j = s % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

let entranceAnimation: ReturnType<typeof animate> | null = null

/**
 * Rows fade and rise in sequence, then hand off to each row's marquee via
 * `isEntranceComplete` — scrolling must not start under a moving row or the
 * two transforms fight for the same `transform` property.
 */
function runEntrance() {
  const rowElements = wallRef.value?.querySelectorAll('.skill-row')

  if (!rowElements?.length || prefersReducedMotion()) {
    isEntranceComplete.value = true
    return
  }

  utils.set(rowElements, { opacity: 0, translateY: ENTRANCE_RISE_PX })

  entranceAnimation = animate(rowElements, {
    opacity: [0, 1],
    translateY: [ENTRANCE_RISE_PX, 0],
    duration: ENTRANCE_DURATION_MS,
    delay: stagger(ENTRANCE_ROW_STAGGER_MS),
    ease: 'outQuad',
    onComplete: () => {
      isEntranceComplete.value = true
    },
  })
}

onMounted(async () => {
  updateResponsive()
  window.addEventListener('resize', updateResponsive)
  await nextTick()
  runEntrance()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateResponsive)
  entranceAnimation?.revert()
  entranceAnimation = null
})

const rows = computed(() => {
  const allSkills: Skill[] = techSkills as Skill[]
  return Array.from({ length: rowCount.value }, (_, i) =>
    shuffleWithSeed(allSkills, (i + 1) * 7919),
  )
})
</script>

<template>
  <div
    ref="wallRef"
    class="w-full overflow-hidden"
    role="img"
    aria-label="Technology skills showcase"
  >
    <DiamondRow
      v-for="(rowSkills, index) in rows"
      :key="index"
      :skills="rowSkills"
      :speed="ROW_SPEEDS[index % ROW_SPEEDS.length] ?? 25"
      :row-index="index"
      :diamond-size="diamondSize"
      :mode="store.proficiencyMode"
      :is-entrance-complete="isEntranceComplete"
    />
  </div>
</template>
