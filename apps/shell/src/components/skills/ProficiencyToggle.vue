<script setup lang="ts">
import { useSkillsStore } from '@/stores/skills'
import { PROFICIENCY_MODES } from '@/types/skills'

const store = useSkillsStore()
</script>

<template>
  <div
    class="flex gap-1 rounded-md border border-border bg-surface-raised p-1"
  >
    <button
      v-for="mode in PROFICIENCY_MODES"
      :key="mode.id"
      class="rounded px-2.5 py-1 text-xs font-bold transition-colors"
      :class="
        store.proficiencyMode === mode.id
          ? 'bg-accent text-text-on-accent'
          : 'text-text-muted hover:text-text'
      "
      @click="store.setProficiencyMode(mode.id)"
    >
      {{ mode.label }}
    </button>
  </div>
</template>
