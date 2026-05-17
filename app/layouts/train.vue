<template>
  <div class="min-h-screen bg-forge-bg text-forge-text">
    <!-- Header -->
    <header class="sticky top-0 z-40 bg-forge-surface/90 backdrop-blur-md border-b border-forge-divider">
      <!-- Top bar -->
      <div class="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
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
          <span v-if="profile" class="text-forge-muted text-sm hidden sm:block truncate max-w-32">
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

      <!-- Tab nav -->
      <div class="max-w-3xl mx-auto px-4">
        <div class="flex gap-1 pb-1 overflow-x-auto scrollbar-none">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0"
            :class="isActive(item.to)
              ? 'text-forge-primary bg-forge-primary/10'
              : 'text-forge-muted hover:text-forge-text hover:bg-forge-surfaceAlt'"
          >
            <component :is="item.icon" :size="15" />
            {{ item.label }}
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Page content -->
    <main class="max-w-3xl mx-auto px-4 py-6">
      <slot />
    </main>

    <SharedToastContainer />
  </div>
</template>

<script setup lang="ts">
import { LogOut, ArrowLeft, Home, Activity, LayoutTemplate, History, Settings } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { profile } = storeToRefs(authStore)
const route = useRoute()

const navItems = [
  { to: '/train',            label: 'Inicio',      icon: Home },
  { to: '/train/feed',       label: 'Actividad',   icon: Activity },
  { to: '/train/templates',  label: 'Plantillas',  icon: LayoutTemplate },
  { to: '/train/workout/history', label: 'Historial', icon: History },
  { to: '/train/settings',   label: 'Ajustes',     icon: Settings },
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

<style scoped>
.scrollbar-none::-webkit-scrollbar { display: none; }
.scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
</style>
