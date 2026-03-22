<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="bg-surface-raised border-b border-border">
    <div class="max-w-5xl mx-auto w-full px-4 h-16 flex items-center justify-between">
      <span class="text-base font-bold text-text">nick-site</span>
      <nav class="flex items-center gap-2">
        <RouterLink
          to="/"
          class="text-sm font-normal text-text-muted hover:text-accent transition-colors"
          exact-active-class="!text-accent"
        >
          Home
        </RouterLink>
        <RouterLink
          to="/playground"
          class="text-sm font-normal text-text-muted hover:text-accent transition-colors"
          active-class="!text-accent"
        >
          Playground
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
