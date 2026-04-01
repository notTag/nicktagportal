<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSkillsStore } from '@/stores/skills'
import DiamondRow from './DiamondRow.vue'
import type { Skill } from '@/types/skills'
import techSkills from '@/data/techSkills.json'

const ROW_SPEEDS = [20, 30, 25, 35, 22, 28, 32, 24]

const store = useSkillsStore()
const isEntranceComplete = ref(false)

const diamondSize = ref(80)
const rowCount = ref(7)

const TOOLBAR_HEIGHT = 120

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

  const cellHeight = Math.ceil(diamondSize.value * 1.5) + 4
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

onMounted(() => {
  updateResponsive()
  window.addEventListener('resize', updateResponsive)
  setTimeout(() => {
    isEntranceComplete.value = true
  }, 300)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateResponsive)
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
