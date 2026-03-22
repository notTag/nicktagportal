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
    <!--
      Future remote mounting example:
      <script setup>
      import { defineAsyncComponent } from 'vue'
      // Dynamic import via Module Federation
      // const RemoteApp = defineAsyncComponent(() => import('remoteApp/App'))
      </script>
      <RemoteApp v-if="remoteLoaded" />
    -->
    <div id="remote-mount" class="border-border mt-8 rounded-lg border p-8">
      <div class="text-center">
        <p class="text-text-muted text-base font-bold">No remotes loaded</p>
        <p class="text-text-muted mt-2 text-sm">
          Remote micro-frontends will appear here. Check back as new experiments
          are added.
        </p>
      </div>
    </div>
    <p v-if="route.params.remote" class="text-text-muted mt-4 text-sm">
      Remote: {{ route.params.remote }}
    </p>
  </div>
</template>
