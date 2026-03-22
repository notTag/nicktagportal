<script setup lang="ts"></script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-16 text-center">
    <p class="text-text-muted text-6xl font-bold">404</p>
    <h1 class="text-text mt-4 text-2xl font-bold">Page not found</h1>
    <p class="text-text-muted mt-2 text-base">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <RouterLink to="/" class="text-accent mt-6 inline-block hover:underline">
      Go back home
    </RouterLink>
  </div>
</template>
