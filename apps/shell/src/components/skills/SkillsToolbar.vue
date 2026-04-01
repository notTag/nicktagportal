<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSkillsStore } from '@/stores/skills'
import { debounce } from '@/utils/debounce'
import CategoryPills from './CategoryPills.vue'
import ProficiencyToggle from './ProficiencyToggle.vue'

const store = useSkillsStore()
const localSearch = ref('')

const debouncedSetSearch = debounce((term: string) => {
  store.setSearchTerm(term)
}, 200)

function onSearchInput() {
  debouncedSetSearch(localSearch.value)
}

const activePills = computed(() =>
  Array.from(store.activeCategories).filter((c) => c !== 'All'),
)
</script>

<template>
  <div class="mx-auto w-full max-w-5xl px-4 py-4">
    <!-- Row 1: controls — never moves -->
    <div class="flex items-center gap-3">
      <CategoryPills class="shrink-0" />
      <div class="relative min-w-0 flex-1">
        <input
          v-model="localSearch"
          type="text"
          placeholder="Search skills..."
          class="h-8 w-full rounded-md border border-border bg-surface-raised px-3 text-sm text-text placeholder-text-muted focus:border-accent focus:outline-none"
          @input="onSearchInput"
        />
      </div>
      <ProficiencyToggle class="shrink-0" />
    </div>

    <!-- Row 2: active category pills (below all controls) -->
    <div
      v-if="activePills.length > 0"
      class="mt-2 flex items-center gap-1.5 overflow-x-auto [-webkit-overflow-scrolling:touch]"
    >
      <span
        v-for="cat in activePills"
        :key="cat"
        class="inline-flex shrink-0 items-center gap-1 rounded-full border border-accent bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent"
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
        class="shrink-0 rounded-full px-2 py-0.5 text-xs text-text-muted transition-colors hover:text-text"
        @click="store.toggleCategory('All')"
      >
        Clear all
      </button>
    </div>
  </div>
</template>
