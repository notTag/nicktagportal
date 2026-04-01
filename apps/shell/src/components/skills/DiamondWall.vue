<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useSkillsStore } from '@/stores/skills'
import DiamondRow from './DiamondRow.vue'
import type { Skill } from '@/types/skills'
import techSkills from '@/data/techSkills.json'

const ROW_SPEEDS = [20, 30, 25, 35, 22, 28, 32, 24]

const store = useSkillsStore()
const isVisible = ref(false)
const isEntranceComplete = ref(false)

const diamondSize = ref(80)
const rowCount = ref(7)

/** Toolbar height estimate for row calculation */
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

onMounted(async () => {
  updateResponsive()
  window.addEventListener('resize', updateResponsive)
  await nextTick()
  isVisible.value = true
  setTimeout(() => {
    isEntranceComplete.value = true
  }, 800)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateResponsive)
})

const rows = computed(() => {
  const allSkills: Skill[] = techSkills as Skill[]
  const result: Skill[][] = Array.from({ length: rowCount.value }, () => [])
  allSkills.forEach((skill, i) => {
    result[i % rowCount.value].push(skill)
  })
  return result
})
</script>

<template>
  <div
    ref="wallRef"
    class="w-full overflow-hidden transition-opacity duration-700 ease-out"
    :class="isVisible ? 'opacity-100' : 'opacity-0'"
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
