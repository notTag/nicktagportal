<script setup lang="ts">
import { ref, computed, type CSSProperties } from 'vue'
import { useSkillsStore } from '@/stores/skills'
import type { Skill, ProficiencyMode } from '@/types/skills'

const props = defineProps<{
  skill: Skill
  mode: ProficiencyMode
  diamondSize: number
}>()

const emit = defineEmits<{
  hover: [payload: { skill: Skill; element: HTMLElement }]
  leave: []
}>()

const store = useSkillsStore()
const isHovered = ref(false)
const diamondRef = ref<HTMLElement | null>(null)

const isVisible = computed(() =>
  store.isSkillVisible(props.skill.category, props.skill.displayName),
)

const proficiencyStyle = computed<CSSProperties>(() => {
  switch (props.mode) {
    case 'glow':
      return {
        boxShadow: `0 0 ${4 + props.skill.years * 2}px var(--color-accent)`,
      }
    case 'size':
      return {
        transform: `rotate(45deg) scale(${0.85 + props.skill.years * 0.03})`,
      }
    case 'fill':
      return {
        backgroundColor: `color-mix(in srgb, var(--color-surface-raised) ${Math.min(30 + props.skill.years * 7, 100)}%, transparent)`,
      }
    default:
      return {}
  }
})

const diamondStyle = computed<CSSProperties>(() => {
  const base: CSSProperties = {
    width: `${props.diamondSize}px`,
    height: `${props.diamondSize}px`,
  }

  if (isHovered.value) {
    return {
      ...base,
      transform: 'rotate(45deg) translateY(-4px)',
      boxShadow: '0 4px 16px var(--color-accent)',
    }
  }

  // Merge proficiency style
  const prof = proficiencyStyle.value
  return {
    ...base,
    transform: prof.transform ?? 'rotate(45deg)',
    boxShadow: (prof.boxShadow as string) ?? 'none',
    backgroundColor: prof.backgroundColor,
  }
})

function handleMouseEnter() {
  isHovered.value = true
  if (diamondRef.value) {
    emit('hover', { skill: props.skill, element: diamondRef.value })
  }
}

function handleMouseLeave() {
  isHovered.value = false
  emit('leave')
}

function handleClick() {
  if (isHovered.value) {
    isHovered.value = false
    emit('leave')
  } else {
    isHovered.value = true
    if (diamondRef.value) {
      emit('hover', { skill: props.skill, element: diamondRef.value })
    }
  }
}
</script>

<template>
  <div
    ref="diamondRef"
    class="shrink-0 overflow-hidden rounded-sm border border-border bg-surface-raised transition-[transform,box-shadow,opacity] duration-200 ease-out"
    :class="isVisible ? 'opacity-100' : 'opacity-30'"
    :style="diamondStyle"
    :aria-label="skill.displayName"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <img
      :src="skill.iconPath"
      :alt="skill.displayName"
      class="h-full w-full object-contain p-2"
      :style="{ transform: 'rotate(-45deg)' }"
    />
  </div>
</template>
