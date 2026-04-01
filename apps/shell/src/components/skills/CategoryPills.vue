<script setup lang="ts">
import { computed } from 'vue'
import { useSkillsStore } from '@/stores/skills'

const store = useSkillsStore()

const activePills = computed(() =>
  Array.from(store.activeCategories).filter((c) => c !== 'All'),
)

function onSelect(event: Event) {
  const target = event.target as HTMLSelectElement
  const value = target.value
  if (!value) return
  store.toggleCategory(value)
  // Reset select to placeholder after selection
  target.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Dropdown trigger -->
    <select
      class="h-8 w-full cursor-pointer rounded-md border border-border bg-surface-raised px-2 text-xs font-bold text-text-muted focus:border-accent focus:outline-none sm:w-auto sm:min-w-[160px]"
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

    <!-- Active pills -->
    <div
      v-if="activePills.length > 0"
      class="flex flex-wrap gap-1.5"
    >
      <span
        v-for="cat in activePills"
        :key="cat"
        class="inline-flex items-center gap-1 rounded-full border border-accent bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent"
      >
        {{ cat }}
        <button
          class="ml-0.5 text-accent/60 transition-colors hover:text-text"
          :aria-label="`Remove ${cat} filter`"
          @click="store.toggleCategory(cat)"
        >
          &times;
        </button>
      </span>
      <button
        class="rounded-full px-2 py-0.5 text-xs text-text-muted transition-colors hover:text-text"
        @click="store.toggleCategory('All')"
      >
        Clear all
      </button>
    </div>
  </div>
</template>
