<script setup lang="ts">
import { useSkillsStore } from '@/stores/skills'

const store = useSkillsStore()
</script>

<template>
  <div
    class="flex gap-2 overflow-x-auto [-webkit-overflow-scrolling:touch]"
  >
    <button
      v-for="category in store.allCategories"
      :key="category"
      class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors"
      :class="
        store.activeCategories.has(category)
          ? 'border-accent bg-accent text-text-on-accent'
          : 'border-border bg-surface-raised text-text-muted hover:bg-hover'
      "
      @click="store.toggleCategory(category)"
    >
      {{ category }}
    </button>
  </div>
</template>
