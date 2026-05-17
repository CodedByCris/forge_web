<template>
  <div class="min-h-screen bg-forge-bg text-forge-text">
    <!-- Header -->
    <header class="sticky top-0 z-40 bg-forge-surface/80 backdrop-blur-md border-b border-forge-divider">
      <div class="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <NuxtLink
            to="/"
            class="p-1.5 rounded-lg text-forge-muted hover:text-forge-text hover:bg-forge-surfaceAlt transition-colors"
            title="Volver al inicio"
          >
            <ArrowLeft :size="18" />
          </NuxtLink>
          <NuxtLink to="/train" class="text-gradient-orange font-black text-xl tracking-tight select-none">
            FORGE
          </NuxtLink>
        </div>

        <div class="flex items-center gap-3">
          <span v-if="profile" class="text-forge-muted text-sm hidden sm:block">
            {{ profile.nickname }}
          </span>
          <button
            @click="handleSignOut"
            class="flex items-center gap-1.5 text-forge-muted hover:text-forge-text transition-colors text-sm py-1.5 px-3 rounded-lg hover:bg-forge-surfaceAlt"
          >
            <LogOut :size="15" />
            <span class="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Page content (with bottom padding for nav) -->
    <main class="max-w-2xl mx-auto px-4 py-6 pb-24">
      <slot />
    </main>

    <!-- Bottom Navigation -->
    <nav class="fixed bottom-0 inset-x-0 z-40 bg-forge-surface/90 backdrop-blur-md border-t border-forge-divider">
      <div class="max-w-2xl mx-auto px-4 flex" style="padding-bottom: env(safe-area-inset-bottom)">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors"
          :class="isActive(item.to)
            ? 'text-forge-primary'
            : 'text-forge-muted hover:text-forge-textSec'"
        >
          <component :is="item.icon" :size="22" />
          <span class="text-xs font-medium">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </nav>

    <SharedToastContainer />
  </div>
</template>

<script setup lang="ts">
import { LogOut, Home, Activity, Settings, ArrowLeft } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { profile } = storeToRefs(authStore)
const route = useRoute()

const navItems = [
  { to: '/train', label: 'Inicio', icon: Home },
  { to: '/train/feed', label: 'Actividad', icon: Activity },
  { to: '/train/settings', label: 'Ajustes', icon: Settings },
]

function isActive(to: string): boolean {
  if (to === '/train') return route.path === '/train'
  return route.path.startsWith(to)
}

async function handleSignOut() {
  await authStore.signOut()
  await navigateTo('/train/auth/login')
}
</script>
