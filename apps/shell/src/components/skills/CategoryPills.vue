<script setup lang="ts">
import { useSkillsStore } from '@/stores/skills'

const store = useSkillsStore()

function onSelect(event: Event) {
  const target = event.target as HTMLSelectElement
  const value = target.value
  if (!value) return
  store.toggleCategory(value)
  target.value = ''
}
</script>

<template>
  <select
    class="h-8 cursor-pointer rounded-md border border-border bg-surface-raised px-2 text-xs font-bold text-text-muted focus:border-accent focus:outline-none sm:min-w-[160px]"
    @change="onSelect"
  >
    <option value="" disabled selected>Filter category...</option>
    <option
      v-for="category in store.allCategories"
      :key="category"
      :value="category"
      :disabled="store.activeCategories.has(category)"
    >
      {{ category }}
    </option>
  </select>
</template>
