<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useCmsFaqStore } from '~/stores/cms/faq.store'
import FaqRow from '~/components/cms/faq/FaqRow.vue'
import FaqFormModal from '~/components/cms/faq/FaqFormModal.vue'
import ConfirmModal from '~/components/cms/shared/ConfirmModal.vue'
import EmptyState from '~/components/cms/shared/EmptyState.vue'
import type { CmsFaq } from '~/types/cms/faq'

definePageMeta({ layout: 'cms' })

const faqStore = useCmsFaqStore()

const showFormModal = ref(false)
const editingFaq = ref<CmsFaq | null>(null)

const showDeleteConfirm = ref(false)
const deletingFaq = ref<CmsFaq | null>(null)
const deleting = ref(false)

onMounted(() => {
  faqStore.fetchFaqs()
})

function openCreateModal() {
  editingFaq.value = null
  showFormModal.value = true
}

function openEditModal(faq: CmsFaq) {
  editingFaq.value = faq
  showFormModal.value = true
}

function openDeleteConfirm(faq: CmsFaq) {
  deletingFaq.value = faq
  showDeleteConfirm.value = true
}

async function handleDelete() {
  if (!deletingFaq.value) return
  deleting.value = true
  await faqStore.removeFaq(deletingFaq.value.id)
  deleting.value = false
  showDeleteConfirm.value = false
  deletingFaq.value = null
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-forge-text">Preguntas frecuentes</h1>
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent"
        @click="openCreateModal"
      >
        <Plus class="h-4 w-4" />
        Nueva pregunta
      </button>
    </div>

    <EmptyState
      v-if="faqStore.error"
      title="No se pudieron cargar las preguntas frecuentes"
      :description="faqStore.error"
    />

    <div v-else-if="faqStore.loading" class="text-sm text-forge-muted">
      Cargando…
    </div>

    <EmptyState
      v-else-if="faqStore.faqs.length === 0"
      title="Todavía no hay preguntas frecuentes"
      description="Crea la primera con el botón de arriba."
    />

    <div v-else class="overflow-hidden rounded-xl border border-forge-divider">
      <FaqRow
        v-for="faq in faqStore.faqs"
        :key="faq.id"
        :faq="faq"
        @edit="openEditModal(faq)"
        @delete="openDeleteConfirm(faq)"
        @toggle="(isActive) => faqStore.toggleActive(faq.id, isActive)"
      />
    </div>

    <FaqFormModal
      :open="showFormModal"
      :editing-faq="editingFaq"
      @close="showFormModal = false"
    />

    <ConfirmModal
      :open="showDeleteConfirm"
      title="Eliminar pregunta frecuente"
      :message="`¿Seguro que quieres eliminar «${deletingFaq?.question ?? ''}»? Esta acción no se puede deshacer.`"
      confirm-label="Eliminar"
      :loading="deleting"
      @confirm="handleDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>
