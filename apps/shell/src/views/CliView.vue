<script setup lang="ts">
import { TerminalPanel } from '@ui'
import cliDefaultOutput from '@/data/cliDefaultOutput.json'
import cliCommands from '@/data/cliCommands.json'
</script>

<template>
  <section class="mx-auto max-w-3xl px-4 pt-16 pb-12">
    <h1 class="text-text mb-6 text-4xl font-bold">CLI</h1>
    <TerminalPanel :default-output="cliDefaultOutput" :commands="cliCommands" />
  </section>
</template>
