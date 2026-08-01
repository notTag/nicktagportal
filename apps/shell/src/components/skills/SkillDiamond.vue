<script setup lang="ts">
import { ref, computed, onBeforeUnmount, type CSSProperties } from 'vue'
import { animate } from 'animejs'
import { useSkillsStore } from '@/stores/skills'
import { prefersReducedMotion } from '@/utils/motion'
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
const liftRef = ref<HTMLElement | null>(null)

/** Outer cell is larger than the logo so hover lift and glow are not clipped */
const cellSize = computed(() => Math.ceil(props.diamondSize * 1.5))

const isVisible = computed(() =>
  store.isSkillVisible(props.skill.category, props.skill.displayName),
)

/**
 * Proficiency styling lives on the logo itself and is owned by Vue.
 * Hover styling lives on the wrapper and is owned by anime.js — keeping them on
 * separate elements stops anime.js writes to `transform`/`filter` from being
 * clobbered by Vue re-renders.
 */
const logoStyle = computed<CSSProperties>(() => {
  switch (props.mode) {
    case 'glow':
      return {
        filter: `drop-shadow(0 0 ${2 + props.skill.years}px var(--color-accent))`,
      }
    case 'size':
      return { transform: `scale(${0.85 + props.skill.years * 0.03})` }
    case 'fill':
      return { opacity: Math.min(30 + props.skill.years * 7, 100) / 100 }
    default:
      return {}
  }
})

const HOVER_GLOW_VARIABLE = '--hover-glow'

let hoverAnimation: ReturnType<typeof animate> | null = null

function animateHoverLift(lifted: boolean) {
  if (!liftRef.value || prefersReducedMotion()) return
  hoverAnimation = animate(liftRef.value, {
    translateY: lifted ? -6 : 0,
    scale: lifted ? 1.15 : 1,
    [HOVER_GLOW_VARIABLE]: lifted ? 1 : 0,
    duration: lifted ? 520 : 320,
    ease: lifted ? 'outElastic(1, .55)' : 'outQuad',
  })
}

function enterHover() {
  isHovered.value = true
  animateHoverLift(true)
  if (liftRef.value) {
    emit('hover', { skill: props.skill, element: liftRef.value })
  }
}

function exitHover() {
  isHovered.value = false
  animateHoverLift(false)
  emit('leave')
}

function handleClick() {
  if (isHovered.value) {
    exitHover()
  } else {
    enterHover()
  }
}

onBeforeUnmount(() => {
  hoverAnimation?.revert()
  hoverAnimation = null
})
</script>

<template>
  <div
    class="flex shrink-0 items-center justify-center transition-opacity duration-200 ease-out"
    :class="isVisible ? 'opacity-100' : 'opacity-30'"
    :style="{
      width: `${cellSize}px`,
      height: `${cellSize}px`,
    }"
  >
    <div
      ref="liftRef"
      class="skill-logo-lift"
      :style="{
        width: `${diamondSize}px`,
        height: `${diamondSize}px`,
      }"
      :aria-label="skill.displayName"
      @mouseenter="enterHover"
      @mouseleave="exitHover"
      @click="handleClick"
    >
      <img
        :src="skill.iconPath"
        :alt="skill.displayName"
        class="h-full w-full object-contain"
        :class="{
          'skill-icon-invert': skill.invertInDark,
          'skill-icon-invert-light': skill.invertInLight,
        }"
        :style="logoStyle"
      />
    </div>
  </div>
</template>

<style scoped>
/*
 * anime.js drives --hover-glow from 0 to 1; CSS turns that scalar into a glow
 * that follows the logo silhouette. Animating the variable rather than the
 * `filter` string avoids interpolating drop-shadow syntax.
 */
.skill-logo-lift {
  --hover-glow: 0;
  filter: drop-shadow(
    0 0 calc(var(--hover-glow) * 10px)
      color-mix(in srgb, var(--color-accent) 70%, transparent)
  );
  will-change: transform, filter;
}
</style>
