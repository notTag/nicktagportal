<script setup lang="ts">
import { ref, computed, onBeforeUnmount, type CSSProperties } from 'vue'
import { animate } from 'animejs'
import { useSkillsStore } from '@/stores/skills'
import { prefersReducedMotion } from '@/utils/motion'
import { cellSizeFor } from './layout'
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
const isAnimating = ref(false)
const liftRef = ref<HTMLElement | null>(null)

const cellSize = computed(() => cellSizeFor(props.diamondSize))

const isVisible = computed(() =>
  store.isSkillVisible(props.skill.category, props.skill.displayName),
)

const isGlowMode = computed(() => props.mode === 'glow')

/**
 * Glow is expressed as a CSS variable rather than a `filter` declaration
 * because `img.skill-icon-invert` sets `filter: invert(1) !important`
 * (main.css) and would silently win over any filter set here.
 */
const proficiencyGlowRadius = computed(() =>
  isGlowMode.value ? `${2 + props.skill.years}px` : '0px',
)

/**
 * Proficiency styling is bound by Vue on the logo; hover styling is written by
 * anime.js on the wrapper. Splitting them keeps the two off the same CSS
 * properties, so neither can clobber the other on re-render.
 */
const logoStyle = computed<CSSProperties>(() => {
  switch (props.mode) {
    case 'size':
      return { transform: `scale(${0.85 + props.skill.years * 0.03})` }
    case 'fill':
      // TODO(human): re-encode `fill` proficiency.
      //
      // The outer cell already multiplies everything by opacity-30 when a skill
      // is filtered out of the active category, so encoding proficiency as
      // opacity too means a dimmed 8-year skill (0.3 * 0.86 = 0.26) reads
      // almost the same as a selected 1-year skill (0.37). The signal collides
      // with the filter state.
      //
      // Replace the line below with an encoding that does not use opacity.
      // `props.skill.years` runs roughly 1-10. Return a CSSProperties object.
      return { opacity: Math.min(30 + props.skill.years * 7, 100) / 100 }
    default:
      return {}
  }
})

const HOVER_GLOW_VARIABLE = '--hover-glow'

let hoverAnimation: ReturnType<typeof animate> | null = null

function animateHoverLift(lifted: boolean) {
  if (!liftRef.value || prefersReducedMotion()) return

  isAnimating.value = true
  hoverAnimation?.cancel()
  hoverAnimation = animate(liftRef.value, {
    translateY: lifted ? -4 : 0,
    scale: lifted ? 1.08 : 1,
    [HOVER_GLOW_VARIABLE]: lifted ? 1 : 0,
    duration: lifted ? 260 : 200,
    ease: lifted ? 'outBack' : 'outQuad',
    onComplete: () => {
      // Releasing `will-change` and the filter chain once settled keeps several
      // hundred idle logos off the compositor
      if (!lifted) isAnimating.value = false
    },
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
      :class="{ 'is-glowing': isGlowMode, 'is-animating': isAnimating }"
      :style="{
        width: `${diamondSize}px`,
        height: `${diamondSize}px`,
        '--proficiency-glow': proficiencyGlowRadius,
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
 * anime.js drives --hover-glow from 0 to 1 and Vue binds --proficiency-glow;
 * CSS turns both scalars into shadows that follow the logo silhouette.
 * Animating variables rather than the `filter` string avoids interpolating
 * drop-shadow syntax, which does not interpolate reliably.
 *
 * The filter chain is scoped to logos that actually need it — an always-on
 * filter would force compositing on every duplicated logo in the wall.
 */
.skill-logo-lift {
  --hover-glow: 0;
  --proficiency-glow: 0px;
}

.skill-logo-lift.is-glowing,
.skill-logo-lift.is-animating {
  filter: drop-shadow(0 0 var(--proficiency-glow) var(--color-accent))
    drop-shadow(
      0 0 calc(var(--hover-glow) * 8px)
        color-mix(in srgb, var(--color-accent) 70%, transparent)
    );
}

.skill-logo-lift.is-animating {
  will-change: transform, filter;
}
</style>
