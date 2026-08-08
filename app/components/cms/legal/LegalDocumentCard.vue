<script setup lang="ts">
import { Pencil } from 'lucide-vue-next'
import type { CmsLegalDocument } from '~/types/cms/legal'

defineProps<{
  document: CmsLegalDocument
  title: string
}>()

const emit = defineEmits<{
  edit: []
}>()
</script>

<template>
  <div class="rounded-xl border border-forge-divider bg-forge-surface p-5">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="font-semibold text-forge-text">{{ title }}</h2>
        <p class="mt-1 text-xs text-forge-muted">
          <template v-if="document.contentHtml">
            Versión {{ document.version }} · actualizado el
            {{ document.updatedAt ? document.updatedAt.toLocaleDateString('es-ES') : '—' }}
          </template>
          <template v-else>
            Aún no publicado
          </template>
        </p>
      </div>
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg border border-forge-divider px-3 py-1.5 text-sm text-forge-textSec hover:bg-forge-surfaceAlt hover:text-forge-text"
        @click="emit('edit')"
      >
        <Pencil class="h-4 w-4" />
        Editar
      </button>
    </div>
  </div>
</template>
