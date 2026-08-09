<script setup lang="ts">
import { Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-vue-next'
import type { CmsShopCollection } from '~/types/cms/shopCollection'

defineProps<{
  collection: CmsShopCollection
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
    <div class="min-w-0 flex-1">
      <p class="truncate font-medium text-forge-text">{{ collection.title }}</p>
      <p class="truncate text-xs text-forge-muted">
        {{ collection.badge || '—' }} · {{ collection.itemIds.length }} producto{{ collection.itemIds.length === 1 ? '' : 's' }}
      </p>
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
      :class="collection.isActive
        ? 'bg-forge-success/10 text-forge-success'
        : 'bg-forge-surfaceAlt text-forge-muted'"
      @click="emit('toggle', !collection.isActive)"
    >
      {{ collection.isActive ? 'Activa' : 'Inactiva' }}
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
