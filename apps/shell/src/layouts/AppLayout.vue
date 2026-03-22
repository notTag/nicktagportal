<script setup lang="ts">
import { TheHeader, TheFooter } from '@ui'
import { features } from '@/config/features'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-surface text-text">
    <TheHeader />
    <main class="flex-1">
      <RouterView />
    </main>
    <TheFooter v-if="features.showFooter" />
  </div>
</template>
