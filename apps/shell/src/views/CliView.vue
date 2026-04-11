<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import CliFallback from '@/components/CliFallback.vue'

const RemoteCliView = defineAsyncComponent({
  loader: () => import('cliApp/CliView'),
  errorComponent: CliFallback,
  timeout: 10000,
})
</script>

<template>
  <RemoteCliView />
</template>
