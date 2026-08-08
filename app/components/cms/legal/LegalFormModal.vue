<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCmsLegalStore } from '~/stores/cms/legal.store'
import type { CmsLegalDocument, CmsLegalDocumentId } from '~/types/cms/legal'

const props = defineProps<{
  open: boolean
  title: string
  document: CmsLegalDocument | null
}>()

const emit = defineEmits<{
  close: []
}>()

const legalStore = useCmsLegalStore()

const contentHtml = ref('')
const loading = ref(false)
const errorMessage = ref<string | null>(null)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      contentHtml.value = props.document?.contentHtml ?? ''
      errorMessage.value = null
    }
  },
)

async function handleSubmit() {
  if (!props.document || !contentHtml.value.trim()) return
  loading.value = true
  errorMessage.value = null
  const ok = await legalStore.saveDocument(props.document.id as CmsLegalDocumentId, contentHtml.value.trim())
  loading.value = false
  if (ok) {
    emit('close')
  } else {
    errorMessage.value = 'No se pudo guardar el documento.'
  }
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
    <div class="w-full max-w-2xl rounded-2xl border border-forge-divider bg-forge-surface p-6">
      <h2 class="text-lg font-semibold text-forge-text">Editar {{ title }}</h2>
      <p class="mt-2 text-xs text-forge-muted">
        Pega aquí el HTML del documento (títulos <code>&lt;h2&gt;</code>/<code>&lt;h3&gt;</code>,
        párrafos <code>&lt;p&gt;</code>, listas <code>&lt;ul&gt;/&lt;li&gt;</code>,
        <code>&lt;strong&gt;</code>). Se muestra tal cual, sin editor visual de por medio.
      </p>

      <textarea
        v-model="contentHtml"
        rows="16"
        class="mt-4 w-full resize-none rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 font-mono text-xs text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
      />

      <p v-if="errorMessage" class="mt-4 text-sm text-forge-danger">
        {{ errorMessage }}
      </p>

      <div class="mt-6 flex justify-end gap-3">
        <button
          type="button"
          class="rounded-lg px-4 py-2 text-sm text-forge-textSec hover:bg-forge-surfaceAlt"
          @click="emit('close')"
        >
          Cancelar
        </button>
        <button
          type="button"
          :disabled="loading || !contentHtml.trim()"
          class="rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent disabled:opacity-60"
          @click="handleSubmit"
        >
          {{ loading ? 'Publicando…' : 'Publicar cambios' }}
        </button>
      </div>
    </div>
  </div>
</template>
