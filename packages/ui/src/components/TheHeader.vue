<script setup lang="ts">
import { RouterLink } from 'vue-router'
import ThemeDropdown from './ThemeDropdown.vue'

const { showThemePicker = false, isMobileMenuOpen = false } = defineProps<{
  showThemePicker?: boolean
  isMobileMenuOpen?: boolean
}>()

const emit = defineEmits<{
  'toggle-menu': []
}>()
</script>

<template>
  <header class="bg-surface-raised border-border border-b">
    <div class="mx-auto flex h-16 w-full max-w-5xl items-center gap-16 px-4">
      <span class="text-text text-base font-bold">Nick Tagliasacchi</span>
      <nav class="hidden items-center gap-6 sm:flex">
        <RouterLink
          to="/"
          class="text-text-muted hover:text-accent text-sm font-normal transition-colors"
          exact-active-class="!text-accent"
        >
          Home
        </RouterLink>
        <RouterLink
          to="/skills"
          class="text-text-muted hover:text-accent text-sm font-normal transition-colors"
          active-class="!text-accent"
        >
          Skills
        </RouterLink>
        <RouterLink
          to="/cli"
          class="text-text-muted hover:text-accent text-sm font-normal transition-colors"
          active-class="!text-accent"
        >
          CLI
        </RouterLink>
        <RouterLink
          to="/playground"
          class="text-text-muted hover:text-accent text-sm font-normal transition-colors"
          active-class="!text-accent"
        >
          Playground
        </RouterLink>
      </nav>
      <div v-if="showThemePicker" class="relative ml-auto hidden sm:block">
        <ThemeDropdown />
      </div>
      <button
        class="ml-auto flex h-11 w-11 flex-col items-center justify-center gap-1.5 sm:hidden"
        aria-label="Toggle menu"
        :aria-expanded="isMobileMenuOpen"
        @click="emit('toggle-menu')"
      >
        <span
          class="block h-0.5 w-6 bg-current transition-transform duration-200"
          :class="{ 'translate-y-2 rotate-45': isMobileMenuOpen }"
        />
        <span
          class="block h-0.5 w-6 bg-current transition-opacity duration-200"
          :class="{ 'opacity-0': isMobileMenuOpen }"
        />
        <span
          class="block h-0.5 w-6 bg-current transition-transform duration-200"
          :class="{ '-translate-y-2 -rotate-45': isMobileMenuOpen }"
        />
      </button>
    </div>
  </header>
</template>
