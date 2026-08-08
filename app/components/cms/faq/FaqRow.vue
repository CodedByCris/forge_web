<script setup lang="ts">
import { Pencil, Trash2 } from 'lucide-vue-next'
import type { CmsFaq } from '~/types/cms/faq'

defineProps<{
  faq: CmsFaq
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  toggle: [isActive: boolean]
}>()
</script>

<template>
  <div class="flex items-center justify-between gap-4 border-b border-forge-divider px-4 py-3 text-sm last:border-b-0">
    <div class="min-w-0 flex-1">
      <p class="truncate font-medium text-forge-text">{{ faq.question }}</p>
      <p class="truncate text-xs text-forge-muted">{{ faq.answer }}</p>
    </div>

    <button
      type="button"
      class="shrink-0 rounded px-2 py-1 text-[10px] uppercase tracking-wide"
      :class="faq.isActive
        ? 'bg-forge-success/10 text-forge-success'
        : 'bg-forge-surfaceAlt text-forge-muted'"
      @click="emit('toggle', !faq.isActive)"
    >
      {{ faq.isActive ? 'Activa' : 'Inactiva' }}
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
