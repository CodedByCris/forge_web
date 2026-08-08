<script setup lang="ts">
import { Menu } from 'lucide-vue-next'

const sidebarOpen = useState('cms-sidebar-open', () => false)
</script>

<template>
  <header class="flex h-14 items-center gap-3 border-b border-forge-divider bg-forge-bg px-4 lg:px-6">
    <button
      type="button"
      class="text-forge-textSec lg:hidden"
      aria-label="Abrir menú"
      @click="sidebarOpen = true"
    >
      <Menu class="h-5 w-5" />
    </button>
  </header>
</template>
