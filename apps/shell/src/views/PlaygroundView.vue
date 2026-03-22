<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-16">
    <h1 class="text-2xl font-bold text-text">Playground</h1>
    <p class="text-base text-text-muted mt-2">Micro-frontend experimentation zone</p>
    <div id="remote-mount" class="mt-8 p-8 border border-border rounded-lg">
      <p class="text-sm text-text-muted text-center">No remotes loaded</p>
    </div>
    <p v-if="route.params.remote" class="text-sm text-text-muted mt-4">
      Remote: {{ route.params.remote }}
    </p>
  </div>
</template>
