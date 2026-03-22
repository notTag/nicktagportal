<script setup lang="ts">
import { TheHeader, TheFooter } from '@ui'
import { features } from '@/config/features'
</script>

<template>
  <div class="bg-surface text-text flex min-h-screen flex-col">
    <TheHeader />
    <main class="flex-1">
      <RouterView />
    </main>
    <TheFooter v-if="features.showFooter" />
  </div>
</template>
