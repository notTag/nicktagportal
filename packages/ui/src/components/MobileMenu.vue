<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { themeList } from '@/themes'

const { isOpen } = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const store = useThemeStore()
const closeButtonRef = ref<HTMLButtonElement | null>(null)

watch(
  () => isOpen,
  (open) => {
    if (open) {
      nextTick(() => {
        closeButtonRef.value?.focus()
      })
    }
  },
)
</script>

<template>
  <Transition
    enter-from-class="opacity-0 translate-x-full"
    enter-to-class="opacity-100 translate-x-0"
    enter-active-class="transition-all duration-200 ease-out"
    leave-from-class="opacity-100 translate-x-0"
    leave-to-class="opacity-0 translate-x-full"
    leave-active-class="transition-all duration-200 ease-in"
  >
    <div
      v-if="isOpen"
      role="dialog"
      aria-label="Main menu"
      aria-modal="true"
      class="fixed inset-0 z-50 flex flex-col bg-surface p-6"
      @keydown.escape="emit('close')"
    >
      <button
        ref="closeButtonRef"
        class="flex h-11 w-11 items-center justify-center self-end text-2xl text-text"
        aria-label="Close menu"
        @click="emit('close')"
      >
        &#x2715;
      </button>

      <nav class="mt-8 flex flex-col gap-6">
        <RouterLink
          to="/"
          class="block py-2 text-2xl font-bold text-text"
          exact-active-class="!text-accent"
          @click="emit('close')"
        >
          Home
        </RouterLink>
        <RouterLink
          to="/cli"
          class="block py-2 text-2xl font-bold text-text"
          active-class="!text-accent"
          @click="emit('close')"
        >
          CLI
        </RouterLink>
        <RouterLink
          to="/playground"
          class="block py-2 text-2xl font-bold text-text"
          active-class="!text-accent"
          @click="emit('close')"
        >
          Playground
        </RouterLink>
      </nav>

      <div class="mt-8">
        <h2 class="text-sm font-bold uppercase tracking-wider text-text-muted">
          Theme
        </h2>
        <div class="mt-4 flex flex-col gap-2">
          <button
            v-for="theme in themeList"
            :key="theme.id"
            class="flex w-full items-center gap-2 py-2 text-left text-base text-text"
            :class="{ 'text-accent': theme.id === store.confirmedThemeId }"
            @click="store.setTheme(theme.id)"
          >
            <span class="w-5 text-accent">{{ theme.id === store.confirmedThemeId ? '\u2713' : '' }}</span>
            <span>{{ theme.name }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
