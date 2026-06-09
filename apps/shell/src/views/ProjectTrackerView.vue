<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const RemoteProjectTrackerView = defineAsyncComponent({
  loader: () => import('projectTrackerApp/DashboardView'),
  errorComponent: {
    template: `
      <div class="mx-auto flex max-w-5xl flex-col px-4 pt-6 pb-6">
        <div class="bg-surface-raised border-border text-text-muted rounded-lg border p-8">
          <p class="font-mono text-sm">Project Tracker remote failed to load.</p>
        </div>
      </div>
    `,
  },
  timeout: 10000,
})
</script>

<template>
  <RemoteProjectTrackerView />
</template>
