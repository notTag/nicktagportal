<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { TerminalPanel } from '@ui'
import profile from '@/data/profile.json'
import cliDefaultOutput from '@/data/cliDefaultOutput.json'
import cliCommands from '@/data/cliCommands.json'
import techSkills from '@/data/techSkills.json'

const skillsByCategory = computed(() => {
  const grouped: Record<string, typeof techSkills> = {}
  for (const skill of techSkills) {
    if (!grouped[skill.category]) {
      grouped[skill.category] = []
    }
    grouped[skill.category].push(skill)
  }
  return grouped
})
</script>

<template>
  <section class="mx-auto max-w-2xl px-4 pt-16 pb-12 text-left sm:text-center">
    <h1 class="text-text text-4xl font-bold">
      {{ profile.name }}
    </h1>
    <p class="text-text mt-2 text-2xl font-bold">
      {{ profile.roleTrajectory }}
    </p>
    <p class="text-text-muted mx-auto mt-4 max-w-2xl text-base leading-normal">
      {{ profile.bio }}
    </p>
    <RouterLink
      to="/playground"
      class="bg-accent text-surface mt-8 inline-block rounded-lg px-6 py-3 text-sm font-bold transition-opacity hover:opacity-90"
    >
      Explore Playground
    </RouterLink>
  </section>

  <section class="mx-auto max-w-3xl px-4 py-12">
    <TerminalPanel :default-output="cliDefaultOutput" :commands="cliCommands" />
  </section>

  <section class="mx-auto max-w-4xl px-4 pt-12 pb-16">
    <h2 class="text-text mb-6 text-2xl font-bold">Tech Stack</h2>
    <div class="flex flex-col gap-6">
      <div v-for="(skills, category) in skillsByCategory" :key="category">
        <h3 class="text-accent-cyan mb-2 text-sm font-bold">
          {{ category }}
        </h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="skill in skills"
            :key="skill.name"
            class="bg-surface-raised text-text rounded-full px-3 py-1 text-sm"
          >
            {{ skill.displayName }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
