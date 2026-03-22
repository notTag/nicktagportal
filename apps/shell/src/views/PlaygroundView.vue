<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-16">
    <h1 class="text-text text-2xl font-bold">Playground</h1>
    <p class="text-text-muted mt-2 text-base">
      Micro-frontend experimentation zone
    </p>
    <div id="remote-mount" class="border-border mt-8 rounded-lg border p-8">
      <p class="text-text-muted text-center text-sm">No remotes loaded</p>
    </div>
    <p v-if="route.params.remote" class="text-text-muted mt-4 text-sm">
      Remote: {{ route.params.remote }}
    </p>
  </div>
</template>
