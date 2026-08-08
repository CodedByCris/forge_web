<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCmsLegalStore } from '~/stores/cms/legal.store'
import LegalDocumentCard from '~/components/cms/legal/LegalDocumentCard.vue'
import LegalFormModal from '~/components/cms/legal/LegalFormModal.vue'
import EmptyState from '~/components/cms/shared/EmptyState.vue'
import type { CmsLegalDocument, CmsLegalDocumentId } from '~/types/cms/legal'

definePageMeta({ layout: 'cms' })

const legalStore = useCmsLegalStore()

const TITLES: Record<CmsLegalDocumentId, string> = {
  privacy_policy: 'Política de privacidad',
  terms_of_service: 'Términos de servicio',
}

const showModal = ref(false)
const editingDocument = ref<CmsLegalDocument | null>(null)
const editingTitle = computed(() => editingDocument.value ? TITLES[editingDocument.value.id] : '')

onMounted(() => {
  legalStore.fetchDocuments()
})

function openEdit(document: CmsLegalDocument) {
  editingDocument.value = document
  showModal.value = true
}
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-bold text-forge-text">Legal</h1>

    <EmptyState
      v-if="legalStore.error"
      title="No se pudieron cargar los documentos legales"
      :description="legalStore.error"
    />

    <div v-else-if="legalStore.loading" class="text-sm text-forge-muted">
      Cargando…
    </div>

    <div v-else class="space-y-4">
      <LegalDocumentCard
        v-for="document in legalStore.documents"
        :key="document.id"
        :document="document"
        :title="TITLES[document.id]"
        @edit="openEdit(document)"
      />
    </div>

    <LegalFormModal
      :open="showModal"
      :title="editingTitle"
      :document="editingDocument"
      @close="showModal = false"
    />
  </div>
</template>
