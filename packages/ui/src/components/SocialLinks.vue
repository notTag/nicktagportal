<script setup lang="ts">
import { computed } from 'vue'

interface SocialLink {
  type: string
  label: string
  url: string
  icon: string
}

const { links = [], orientation = 'center' } = defineProps<{
  links?: SocialLink[]
  orientation?: 'left' | 'right' | 'center' | 'none'
}>()

const orientationClass = computed(() => {
  const map: Record<string, string> = {
    center: 'justify-center',
    left: 'justify-start',
    right: 'justify-end',
    none: 'hidden',
  }
  return map[orientation] ?? 'justify-center'
})
</script>

<template>
  <div :class="['flex flex-wrap gap-2', orientationClass]">
    <a
      v-for="link in links"
      :key="link.type"
      :href="link.url"
      target="_blank"
      rel="noopener noreferrer"
      class="text-text-muted hover:text-accent text-sm transition-colors"
    >
      {{ link.label }}
    </a>
  </div>
</template>
