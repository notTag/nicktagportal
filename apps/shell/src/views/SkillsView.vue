<script setup lang="ts">
import SkillsToolbar from '@/components/skills/SkillsToolbar.vue'
import DiamondWall from '@/components/skills/DiamondWall.vue'
</script>

<template>
  <div class="bg-surface flex min-h-full flex-col">
    <SkillsToolbar />
    <div
      class="flex-1 overflow-hidden pt-6 sm:-mx-[calc(var(--sidebar-rail)+2rem)]"
    >
      <DiamondWall />
    </div>
  </div>
</template>
