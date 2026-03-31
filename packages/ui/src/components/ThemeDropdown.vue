<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { themeList } from '@/themes'

const store = useThemeStore()

const isOpen = ref(false)
const activeIndex = ref(-1)
const wrapperRef = ref<HTMLDivElement | null>(null)
const listboxRef = ref<HTMLDivElement | null>(null)

function open() {
  isOpen.value = true
  const confirmedIdx = themeList.findIndex(
    (t) => t.id === store.confirmedThemeId,
  )
  activeIndex.value = confirmedIdx >= 0 ? confirmedIdx : 0
  nextTick(() => {
    listboxRef.value?.focus()
  })
}

function close() {
  isOpen.value = false
  activeIndex.value = -1
}

function toggle() {
  if (isOpen.value) {
    store.revertPreview()
    close()
  } else {
    open()
  }
}

function handleTriggerKeydown(e: KeyboardEvent) {
  if (!isOpen.value && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
    e.preventDefault()
    open()
  }
}

function handleListboxKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown': {
      e.preventDefault()
      const next = Math.min(activeIndex.value + 1, themeList.length - 1)
      activeIndex.value = next
      store.previewTheme(themeList[next].id)
      break
    }
    case 'ArrowUp': {
      e.preventDefault()
      const prev = Math.max(activeIndex.value - 1, 0)
      activeIndex.value = prev
      store.previewTheme(themeList[prev].id)
      break
    }
    case 'Enter': {
      e.preventDefault()
      store.setTheme(themeList[activeIndex.value].id)
      close()
      break
    }
    case 'Escape': {
      e.preventDefault()
      store.revertPreview()
      close()
      break
    }
    case 'Tab': {
      store.revertPreview()
      close()
      break
    }
  }
}

function handleOptionClick(index: number) {
  store.setTheme(themeList[index].id)
  close()
}

function handleOptionMouseEnter(index: number) {
  activeIndex.value = index
  store.previewTheme(themeList[index].id)
}

function handleClickOutside(e: MouseEvent) {
  if (isOpen.value && wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    store.revertPreview()
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
})
</script>

<template>
  <div ref="wrapperRef" class="relative">
    <div
      role="button"
      tabindex="0"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      class="cursor-pointer text-sm font-normal text-text-muted transition-colors hover:text-accent"
      @click="toggle"
      @keydown="handleTriggerKeydown"
    >
      Theme &#x25BE;
    </div>

    <div
      v-if="isOpen"
      ref="listboxRef"
      role="listbox"
      aria-label="Select theme"
      :aria-activedescendant="activeIndex >= 0 ? `theme-option-${themeList[activeIndex].id}` : undefined"
      tabindex="-1"
      class="absolute right-0 top-full z-40 mt-2 w-[220px] rounded-lg border border-border bg-surface-overlay py-2 shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
      @keydown="handleListboxKeydown"
    >
      <div
        v-for="(theme, index) in themeList"
        :id="`theme-option-${theme.id}`"
        :key="theme.id"
        role="option"
        :aria-selected="theme.id === store.confirmedThemeId"
        class="mx-1 cursor-pointer rounded px-2 py-1.5 text-sm text-text"
        :class="{
          'bg-selection': index === activeIndex,
          'hover:bg-hover': index !== activeIndex,
        }"
        @click="handleOptionClick(index)"
        @mouseenter="handleOptionMouseEnter(index)"
      >
        <span
          v-if="theme.id === store.confirmedThemeId"
          class="text-accent"
        >&#x2713; </span>{{ theme.name }}
      </div>
    </div>
  </div>
</template>
