<script setup lang="ts">
import { ref } from 'vue'
import { useTerminal } from '@/composables/useTerminal'

const terminalContainer = ref<HTMLElement | null>(null)
useTerminal(terminalContainer)
</script>

<template>
  <div
    class="mx-auto flex max-w-5xl flex-col px-4 pt-6 pb-6"
    style="height: calc(100vh - 4rem)"
  >
    <div
      ref="terminalContainer"
      class="min-h-0 flex-1 overflow-hidden rounded-lg"
    />
  </div>
</template>
