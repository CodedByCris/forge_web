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
          class="px-3 py-2 rounded-xl text-sm font-medium transition-colors hidden sm:block"
          :class="route.path === '/'
            ? 'text-forge-text bg-forge-surface'
            : 'text-forge-muted hover:text-forge-text hover:bg-forge-surface/60'"
        >
          Inicio
        </NuxtLink>
        <NuxtLink
          to="/pricing"
          class="px-3 py-2 rounded-xl text-sm font-medium transition-colors hidden sm:block"
          :class="route.path === '/pricing'
            ? 'text-forge-text bg-forge-surface'
            : 'text-forge-muted hover:text-forge-text hover:bg-forge-surface/60'"
        >
          Precios
        </NuxtLink>
        <div class="w-px h-5 bg-forge-divider mx-1 hidden sm:block" />
        <NuxtLink
          to="/train/auth/login"
          class="px-3 py-2 rounded-xl text-sm font-medium text-forge-muted hover:text-forge-text hover:bg-forge-surface/60 transition-colors"
        >
          Login
        </NuxtLink>
        <NuxtLink
          to="/train/auth/register"
          class="px-4 py-2 rounded-xl text-sm font-bold gradient-orange text-white glow-orange-hover transition-all"
        >
          Empezar gratis
        </NuxtLink>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
</script>
