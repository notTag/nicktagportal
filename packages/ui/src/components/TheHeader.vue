<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="bg-surface-raised border-border border-b">
    <div class="mx-auto flex h-16 w-full max-w-5xl items-center gap-16 px-4">
      <span class="text-text text-base font-bold">Nick Tagliasacchi</span>
      <nav class="flex items-center gap-6">
        <RouterLink
          to="/"
          class="text-text-muted hover:text-accent text-sm font-normal transition-colors"
          exact-active-class="!text-accent"
        >
          Home
        </RouterLink>
        <RouterLink
          to="/cli"
          class="text-text-muted hover:text-accent text-sm font-normal transition-colors"
          active-class="!text-accent"
        >
          CLI
        </RouterLink>
        <RouterLink
          to="/playground"
          class="text-text-muted hover:text-accent text-sm font-normal transition-colors"
          active-class="!text-accent"
        >
          Playground
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
