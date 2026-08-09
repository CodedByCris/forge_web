<script setup lang="ts">
import { Pencil, Trash2, ChevronUp, ChevronDown, ImageOff } from 'lucide-vue-next'
import type { CmsWhatsNewItem } from '~/types/cms/whatsNew'

defineProps<{
  item: CmsWhatsNewItem
  isFirst: boolean
  isLast: boolean
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  toggle: [isActive: boolean]
  moveUp: []
  moveDown: []
}>()
</script>

<template>
  <div class="flex items-center justify-between gap-4 border-b border-forge-divider px-4 py-3 text-sm last:border-b-0">
    <div class="flex min-w-0 flex-1 items-center gap-3">
      <div class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-forge-surfaceAlt">
        <img v-if="item.imageUrl" :src="item.imageUrl" alt="" class="h-full w-full object-cover">
        <ImageOff v-else :size="18" class="text-forge-muted" />
      </div>
      <div class="min-w-0">
        <p class="truncate font-medium text-forge-text">{{ item.title }}</p>
        <p class="truncate text-xs text-forge-muted">{{ item.description }}</p>
      </div>
    </div>

    <div class="flex shrink-0 items-center gap-1">
      <button
        type="button"
        class="rounded p-1.5 text-forge-textSec hover:bg-forge-surfaceAlt hover:text-forge-text disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Mover arriba"
        :disabled="isFirst"
        @click="emit('moveUp')"
      >
        <ChevronUp :size="16" />
      </button>
      <button
        type="button"
        class="rounded p-1.5 text-forge-textSec hover:bg-forge-surfaceAlt hover:text-forge-text disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Mover abajo"
        :disabled="isLast"
        @click="emit('moveDown')"
      >
        <ChevronDown :size="16" />
      </button>
    </div>

    <button
      type="button"
      class="shrink-0 rounded px-2 py-1 text-[10px] uppercase tracking-wide"
      :class="item.isActive
        ? 'bg-forge-success/10 text-forge-success'
        : 'bg-forge-surfaceAlt text-forge-muted'"
      @click="emit('toggle', !item.isActive)"
    >
      {{ item.isActive ? 'Activa' : 'Inactiva' }}
    </button>

    <div class="flex shrink-0 items-center gap-1">
      <button
        type="button"
        class="rounded p-2 text-forge-textSec hover:bg-forge-surfaceAlt hover:text-forge-text"
        aria-label="Editar"
        @click="emit('edit')"
      >
        <Pencil class="h-4 w-4" />
      </button>
      <button
        type="button"
        class="rounded p-2 text-forge-textSec hover:bg-forge-danger/10 hover:text-forge-danger"
        aria-label="Eliminar"
        @click="emit('delete')"
      >
        <Trash2 class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
