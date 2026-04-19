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
  if (
    !isOpen.value &&
    (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')
  ) {
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
  if (
    isOpen.value &&
    wrapperRef.value &&
    !wrapperRef.value.contains(e.target as Node)
  ) {
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
  <div ref="wrapperRef" class="flex flex-col">
    <!-- Accordion panel — grows UPWARD from the trigger. In-flow (not absolute),
         so it stays inside the parent sidebar regardless of overflow rules.
         tabindex/focus moves here when opened; aria-hidden flips with isOpen. -->
    <div
      ref="listboxRef"
      role="listbox"
      aria-label="Select theme"
      :aria-activedescendant="
        activeIndex >= 0
          ? `theme-option-${themeList[activeIndex].id}`
          : undefined
      "
      :aria-hidden="!isOpen"
      tabindex="-1"
      class="overflow-hidden transition-[max-height,margin,opacity] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
      :class="
        isOpen ? 'mb-2 max-h-[320px] opacity-100' : 'mb-0 max-h-0 opacity-0'
      "
      @keydown="handleListboxKeydown"
    >
      <div
        class="border-border bg-surface-overlay max-h-[320px] overflow-y-auto rounded-lg border py-2"
      >
        <div
          v-for="(theme, index) in themeList"
          :id="`theme-option-${theme.id}`"
          :key="theme.id"
          role="option"
          :aria-selected="theme.id === store.confirmedThemeId"
          class="text-text mx-1 cursor-pointer rounded px-2 py-1.5 text-sm"
          :class="{
            'bg-selection': index === activeIndex,
            'hover:bg-hover': index !== activeIndex,
          }"
          @click="handleOptionClick(index)"
          @mouseenter="handleOptionMouseEnter(index)"
        >
          <span v-if="theme.id === store.confirmedThemeId" class="text-accent"
            >&#x2713; </span
          >{{ theme.name }}
        </div>
      </div>
    </div>

    <!-- Trigger always sits at the bottom so the panel opens upward. -->
    <div
      role="button"
      tabindex="0"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      class="text-text-muted hover:text-accent cursor-pointer text-sm font-normal transition-colors"
      @click="toggle"
      @keydown="handleTriggerKeydown"
    >
      Theme &#x25BE;
    </div>
  </div>
</template>
