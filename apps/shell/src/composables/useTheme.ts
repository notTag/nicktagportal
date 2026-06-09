import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'
import { useThemeEffect } from '@nick_tag_tech/themes/vue'

export function useTheme() {
  const store = useThemeStore()
  const { currentTheme } = storeToRefs(store)

  // Apply CSS variables + data-theme-type on init and on every theme change
  // (switch or preview). DOM application lives in the shared package.
  useThemeEffect(currentTheme)

  return store
}
