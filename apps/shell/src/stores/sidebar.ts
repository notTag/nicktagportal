import { defineStore } from 'pinia'
import { ref } from 'vue'

export type DockedSide = 'left' | 'right'

const STORAGE_KEY = 'nicksite-sidebar-side'

function loadDockedSide(): DockedSide {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'left' || stored === 'right') return stored
  } catch {
    // localStorage may throw in privacy modes / SSR — fall through to default
  }
  return 'left'
}

export const useSidebarStore = defineStore('sidebar', () => {
  const isOpen = ref(false)
  const dockedSide = ref<DockedSide>(loadDockedSide())
  const isDragging = ref(false)

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    isOpen.value = !isOpen.value
  }

  function setDockedSide(side: DockedSide) {
    dockedSide.value = side
    try {
      localStorage.setItem(STORAGE_KEY, side)
    } catch {
      // localStorage may throw — state is already updated in memory
    }
  }

  function setDragging(flag: boolean) {
    isDragging.value = flag
  }

  return {
    isOpen,
    dockedSide,
    isDragging,
    open,
    close,
    toggle,
    setDockedSide,
    setDragging,
  }
})
