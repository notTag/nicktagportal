<script setup lang="ts">
import { TheSidebar, TheFooter, SocialLinks } from '@ui'
import { features } from '@/config/features'
import { useSidebarStore } from '@/stores/sidebar'
import socialLinksData from '@/data/socialLinks.json'
import AppVersion from '@/components/AppVersion.vue'

type Orientation = 'left' | 'right' | 'center' | 'none'

// Shell-side store instance. Passed to TheSidebar as a prop so the UI
// component stays portable toward an eventual @nick/ui package.
const sidebarStore = useSidebarStore()
</script>

<template>
  <div id="app-content" class="bg-surface text-text flex h-screen flex-col">
    <TheSidebar :store="sidebarStore" />
    <main
      class="flex-1 overflow-y-auto [scrollbar-gutter:stable_both-edges] sm:px-[calc(var(--sidebar-rail)+2rem)]"
    >
      <RouterView />
    </main>
    <TheFooter v-if="features.showFooter">
      <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <span aria-hidden="true" />
        <SocialLinks
          :links="socialLinksData.links"
          :orientation="socialLinksData.orientation as Orientation"
        />
        <div class="justify-self-end">
          <AppVersion />
        </div>
      </div>
    </TheFooter>
  </div>
</template>
