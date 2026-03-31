<script setup lang="ts">
import { TheHeader, TheFooter, SocialLinks } from '@ui'
import { features } from '@/config/features'
import socialLinksData from '@/data/socialLinks.json'

type Orientation = 'left' | 'right' | 'center' | 'none'
</script>

<template>
  <div class="bg-surface text-text flex h-screen flex-col">
    <TheHeader :show-theme-picker="features.showThemePicker" />
    <main class="flex-1 overflow-y-auto">
      <RouterView />
    </main>
    <TheFooter v-if="features.showFooter">
      <SocialLinks
        :links="socialLinksData.links"
        :orientation="socialLinksData.orientation as Orientation"
      />
    </TheFooter>
  </div>
</template>
