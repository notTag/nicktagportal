import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const isLoading = ref(false)
  const currentRemote = ref<string | null>(null)

  const hasActiveRemote = computed(() => currentRemote.value !== null)

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  return { isLoading, currentRemote, hasActiveRemote, setLoading }
})
