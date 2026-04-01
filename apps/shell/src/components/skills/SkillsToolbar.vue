<script setup lang="ts">
import { ref } from 'vue'
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
</script>

<template>
  <div class="mx-auto w-full max-w-5xl px-4 py-4">
    <!-- Top row: category dropdown, search, proficiency toggle -->
    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3"
    >
      <CategoryPills class="w-full shrink-0 sm:w-auto" />
      <div class="relative min-w-0 flex-1">
        <input
          v-model="localSearch"
          type="text"
          placeholder="Search skills..."
          class="h-8 w-full min-w-[200px] rounded-md border border-border bg-surface-raised px-3 text-sm text-text placeholder-text-muted focus:border-accent focus:outline-none"
          @input="onSearchInput"
        />
      </div>
      <ProficiencyToggle class="shrink-0" />
    </div>
  </div>
</template>
