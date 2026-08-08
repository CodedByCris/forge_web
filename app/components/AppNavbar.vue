<template>
  <header class="sticky top-0 z-50 bg-forge-bg/80 backdrop-blur-md border-b border-forge-divider/60">
    <nav class="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink to="/" class="text-gradient-orange font-black text-xl tracking-tight select-none">
        FORGE
      </NuxtLink>

      <!-- Links -->
      <div class="flex items-center gap-1">
        <NuxtLink
          to="/"
          class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          :class="route.path === '/'
            ? 'text-forge-text bg-forge-surface'
            : 'text-forge-muted hover:text-forge-text hover:bg-forge-surface/60'"
        >
          Inicio
        </NuxtLink>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
</script>
