<script setup lang="ts">
import { ref, watch } from 'vue'
import { TheHeader, TheFooter, SocialLinks, MobileMenu } from '@ui'
import { features } from '@/config/features'
import socialLinksData from '@/data/socialLinks.json'
import AppVersion from '@/components/AppVersion.vue'

type Orientation = 'left' | 'right' | 'center' | 'none'

const isMobileMenuOpen = ref(false)

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

watch(isMobileMenuOpen, (open) => {
  const appContent = document.getElementById('app-content')
  if (appContent) {
    if (open) {
      appContent.setAttribute('inert', '')
      appContent.setAttribute('aria-hidden', 'true')
    } else {
      appContent.removeAttribute('inert')
      appContent.removeAttribute('aria-hidden')
    }
  }
})
</script>

<template>
  <div id="app-content" class="bg-surface text-text flex h-screen flex-col">
    <TheHeader
      :show-theme-picker="features.showThemePicker"
      :is-mobile-menu-open="isMobileMenuOpen"
      @toggle-menu="toggleMobileMenu"
    />
    <main class="flex-1 overflow-y-auto">
      <RouterView />
    </main>
    <TheFooter v-if="features.showFooter">
      <AppVersion />
      <SocialLinks
        :links="socialLinksData.links"
        :orientation="socialLinksData.orientation as Orientation"
      />
    </TheFooter>
  </div>
  <MobileMenu :is-open="isMobileMenuOpen" @close="closeMobileMenu" />
</template>
