<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useSkillsStore } from '@/stores/skills'
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'
import DiamondRow from './DiamondRow.vue'
import type { Skill } from '@/types/skills'
import techSkills from '@/data/techSkills.json'

const ROW_SPEEDS = [20, 30, 25, 35, 22]

const store = useSkillsStore()
const wallRef = ref<HTMLElement | null>(null)
const { isVisible } = useIntersectionObserver(wallRef, {
  threshold: 0.1,
  once: true,
})
const isEntranceComplete = ref(false)

const diamondSize = ref(80)
const rowCount = ref(4)

function updateResponsive() {
  const w = window.innerWidth
  if (w < 640) {
    diamondSize.value = 48
    rowCount.value = 3
  } else if (w < 1024) {
    diamondSize.value = 56
    rowCount.value = 4
  } else {
    diamondSize.value = 80
    rowCount.value = w > 1280 ? 5 : 4
  }
}

onMounted(() => {
  updateResponsive()
  window.addEventListener('resize', updateResponsive)
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

watch(isVisible, (visible) => {
  if (visible) {
    const totalDiamonds = techSkills.length
    const entranceDuration = totalDiamonds * 30 + 400 + 200
    setTimeout(() => {
      isEntranceComplete.value = true
    }, entranceDuration)
  }
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
      :speed="ROW_SPEEDS[index] ?? 25"
      :row-index="index"
      :diamond-size="diamondSize"
      :mode="store.proficiencyMode"
      :is-entrance-complete="isEntranceComplete"
      :class="isVisible ? '' : 'opacity-0'"
    />
  </div>
</template>

<style scoped>
@keyframes diamond-entrance {
  from {
    opacity: 0;
    transform: rotate(45deg) scale(0.7);
  }
  to {
    opacity: 1;
    transform: rotate(45deg) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  @keyframes diamond-entrance {
    from {
      opacity: 1;
      transform: rotate(45deg) scale(1);
    }
    to {
      opacity: 1;
      transform: rotate(45deg) scale(1);
    }
  }
}
</style>
