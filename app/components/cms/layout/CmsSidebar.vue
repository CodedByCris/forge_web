<script setup lang="ts">
import {
  LayoutDashboard,
  Dumbbell,
  FileText,
  HelpCircle,
  Users,
  ShieldAlert,
  Bell,
  Settings,
  LogOut,
} from 'lucide-vue-next'
import { useCmsAuthStore } from '~/stores/cms/auth.store'

const authStore = useCmsAuthStore()
const sidebarOpen = useState('cms-sidebar-open', () => false)

const comingSoon = [
  { label: 'Ejercicios', icon: Dumbbell },
  { label: 'Moderación', icon: ShieldAlert },
  { label: 'Notificaciones', icon: Bell },
  { label: 'Configuración', icon: Settings },
]

async function handleLogout() {
  await authStore.logout()
  await navigateTo('/cms/login')
}
</script>

<template>
  <div
    v-if="sidebarOpen"
    class="fixed inset-0 z-30 bg-black/60 lg:hidden"
    @click="sidebarOpen = false"
  />

  <aside
    class="fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col border-r border-forge-divider bg-forge-surface transition-transform duration-300 ease-out lg:static lg:translate-x-0"
    :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="px-5 py-6">
      <span class="text-lg font-bold text-forge-text">
        Forge <span class="text-forge-primary">CMS</span>
      </span>
    </div>

    <nav class="flex-1 space-y-1 px-3">
      <NuxtLink
        to="/cms"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-forge-textSec transition-all duration-150 ease-out hover:bg-forge-surfaceAlt hover:text-forge-text"
        active-class="!bg-forge-primary/10 !text-forge-primary border-l-2 border-forge-primary"
      >
        <LayoutDashboard class="h-4 w-4" />
        Dashboard
      </NuxtLink>

      <NuxtLink
        to="/cms/usuarios"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-forge-textSec transition-all duration-150 ease-out hover:bg-forge-surfaceAlt hover:text-forge-text"
        active-class="!bg-forge-primary/10 !text-forge-primary border-l-2 border-forge-primary"
      >
        <Users class="h-4 w-4" />
        Usuarios
      </NuxtLink>

      <NuxtLink
        to="/cms/faq"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-forge-textSec transition-all duration-150 ease-out hover:bg-forge-surfaceAlt hover:text-forge-text"
        active-class="!bg-forge-primary/10 !text-forge-primary border-l-2 border-forge-primary"
      >
        <HelpCircle class="h-4 w-4" />
        FAQ
      </NuxtLink>

      <NuxtLink
        to="/cms/legal"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-forge-textSec transition-all duration-150 ease-out hover:bg-forge-surfaceAlt hover:text-forge-text"
        active-class="!bg-forge-primary/10 !text-forge-primary border-l-2 border-forge-primary"
      >
        <FileText class="h-4 w-4" />
        Legal
      </NuxtLink>

      <div
        v-for="item in comingSoon"
        :key="item.label"
        class="flex cursor-not-allowed items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-forge-muted"
      >
        <span class="flex items-center gap-3">
          <component :is="item.icon" class="h-4 w-4" />
          {{ item.label }}
        </span>
        <span class="rounded bg-forge-surfaceAlt px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-forge-muted">
          Próximamente
        </span>
      </div>
    </nav>

    <div class="space-y-2 border-t border-forge-divider px-3 py-4">
      <p class="truncate px-3 text-xs text-forge-muted">{{ authStore.user?.email }}</p>
      <button
        type="button"
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-forge-textSec transition-colors hover:bg-forge-surfaceAlt hover:text-forge-text"
        @click="handleLogout"
      >
        <LogOut class="h-4 w-4" />
        Cerrar sesión
      </button>
    </div>
  </aside>
</template>
