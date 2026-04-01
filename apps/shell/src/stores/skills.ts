import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ProficiencyMode } from '@/types/skills'
import techSkills from '@/data/techSkills.json'

export const useSkillsStore = defineStore('skills', () => {
  // --- State ---
  const activeCategories = ref<Set<string>>(new Set(['All']))
  const searchTerm = ref('')
  const proficiencyMode = ref<ProficiencyMode>('uniform')

  // --- Getters ---
  const allCategories = computed(() => {
    const cats = new Set(techSkills.map((s) => s.category))
    return ['All', ...Array.from(cats).sort()]
  })

  // --- Actions ---

  /**
   * Toggle a category pill on/off (per D-16).
   * - Selecting "All" deselects all individual categories.
   * - Selecting an individual category deselects "All".
   * - If no individual categories remain after toggle, re-select "All".
   */
  function toggleCategory(category: string) {
    if (category === 'All') {
      activeCategories.value = new Set(['All'])
      return
    }

    const next = new Set(activeCategories.value)
    next.delete('All')

    if (next.has(category)) {
      next.delete(category)
    } else {
      next.add(category)
    }

    // If nothing selected, fall back to All
    if (next.size === 0) {
      activeCategories.value = new Set(['All'])
    } else {
      activeCategories.value = next
    }
  }

  /** Update search term (per D-17). Caller debounces. */
  function setSearchTerm(term: string) {
    searchTerm.value = term
  }

  /** Set proficiency visualization mode (per D-19). */
  function setProficiencyMode(mode: ProficiencyMode) {
    proficiencyMode.value = mode
  }

  /**
   * Check if a specific skill should be at full opacity (per D-18).
   * Non-matching skills dim to 30% opacity in place -- no layout reflow.
   * Returns true if skill matches ALL active filters (category AND search).
   */
  function isSkillVisible(
    skillCategory: string,
    skillDisplayName: string,
  ): boolean {
    const categoryMatch =
      activeCategories.value.has('All') ||
      activeCategories.value.has(skillCategory)
    const searchMatch =
      !searchTerm.value ||
      skillDisplayName.toLowerCase().includes(searchTerm.value.toLowerCase())
    return categoryMatch && searchMatch
  }

  return {
    // State
    activeCategories,
    searchTerm,
    proficiencyMode,
    // Getters
    allCategories,
    // Actions
    toggleCategory,
    setSearchTerm,
    setProficiencyMode,
    isSkillVisible,
  }
})
