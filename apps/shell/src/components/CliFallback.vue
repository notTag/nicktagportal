<script setup lang="ts">
// Terminal-flavored error component per D-14
// Displayed as errorComponent of defineAsyncComponent per D-15
</script>

<template>
  <div
    class="mx-auto flex max-w-5xl flex-col px-4 pt-6 pb-6"
    style="height: calc(100vh - 4rem)"
  >
    <div
      class="flex min-h-0 flex-1 items-center justify-center rounded-lg"
      style="background-color: #1e1e1e"
    >
      <pre class="font-mono text-sm text-gray-400">
+------------------------------------------+
|  ERROR: CLI remote failed to load        |
|                                          |
|  Remote: cliApp/CliView                  |
|  Try refreshing the page.                |
+------------------------------------------+
      </pre>
    </div>
  </div>
</template>
