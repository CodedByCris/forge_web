<template>
  <div class="min-h-screen bg-forge-bg text-forge-text">
    <!-- Header -->
    <header class="sticky top-0 z-40 bg-forge-surface/80 backdrop-blur-md border-b border-forge-divider">
      <div class="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <NuxtLink to="/train" class="text-gradient-orange font-black text-xl tracking-tight select-none">
          FORGE
        </NuxtLink>

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

    <!-- Page content -->
    <main class="max-w-2xl mx-auto px-4 py-6">
      <slot />
    </main>

    <SharedToastContainer />
  </div>
</template>

<script setup lang="ts">
import { LogOut } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { profile } = storeToRefs(authStore)

async function handleSignOut() {
  await authStore.signOut()
  await navigateTo('/train/auth/login')
}
</script>
