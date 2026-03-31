<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'

interface TerminalEntry {
  input: string
  output: string
}

interface CommandDef {
  description: string
  output: string
}

const { defaultOutput = [], commands = {} } = defineProps<{
  defaultOutput?: TerminalEntry[]
  commands?: Record<string, CommandDef>
}>()

const history = ref<TerminalEntry[]>([...defaultOutput])
const currentInput = ref('')
const historyEnd = ref<HTMLElement | null>(null)

function executeCommand(input: string): string {
  const [cmd] = input.trim().split(' ')
  const entry = commands[cmd]
  if (entry) return entry.output
  return `command not found: ${cmd}`
}

async function handleSubmit() {
  const input = currentInput.value.trim()
  if (!input) return
  const output = executeCommand(input)
  history.value.push({ input, output })
  currentInput.value = ''
  await nextTick()
  historyEnd.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

onMounted(() => {
  historyEnd.value?.scrollIntoView({ block: 'nearest' })
})
</script>

<template>
  <div
    class="border-border bg-surface-raised rounded-lg border p-8"
    style="box-shadow: 0 0 15px rgba(114, 241, 184, 0.15)"
  >
    <div class="max-h-[400px] overflow-y-auto font-mono text-sm">
      <div v-for="(entry, i) in history" :key="i" class="mb-3">
        <div class="flex gap-2">
          <span class="text-accent font-bold">$</span>
          <span class="text-text">{{ entry.input }}</span>
        </div>
        <div
          class="mt-1 ml-5 whitespace-pre-wrap"
          :class="
            entry.output.startsWith('command not found')
              ? 'text-destructive'
              : 'text-accent-cyan'
          "
        >
          {{ entry.output }}
        </div>
      </div>
      <div ref="historyEnd" />
    </div>
    <form
      class="mt-4 flex items-center gap-2 font-mono text-sm"
      @submit.prevent="handleSubmit"
    >
      <span class="text-accent font-bold">$</span>
      <div class="relative flex-1">
        <input
          v-model="currentInput"
          type="text"
          class="text-text placeholder:text-text-muted w-full bg-transparent caret-transparent outline-none"
          placeholder="Type a command..."
          autofocus
        />
        <span
          class="bg-accent-yellow pointer-events-none absolute top-1/2 h-4 w-[0.5ch] -translate-y-1/2 animate-[blink_1s_step-end_infinite]"
          :style="{ left: `${currentInput.length}ch` }"
        />
      </div>
    </form>
  </div>
</template>

<style>
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
