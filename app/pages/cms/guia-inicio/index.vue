<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useCmsGettingStartedStore } from '~/stores/cms/gettingStarted.store'
import GettingStartedRow from '~/components/cms/gettingStarted/GettingStartedRow.vue'
import GettingStartedFormModal from '~/components/cms/gettingStarted/GettingStartedFormModal.vue'
import ConfirmModal from '~/components/cms/shared/ConfirmModal.vue'
import EmptyState from '~/components/cms/shared/EmptyState.vue'
import type { CmsGettingStartedItem } from '~/types/cms/gettingStarted'

definePageMeta({ layout: 'cms' })

const gettingStartedStore = useCmsGettingStartedStore()

const showFormModal = ref(false)
const editingItem = ref<CmsGettingStartedItem | null>(null)

const showDeleteConfirm = ref(false)
const deletingItem = ref<CmsGettingStartedItem | null>(null)
const deleting = ref(false)

onMounted(() => {
  gettingStartedStore.fetchItems()
})

function openCreateModal() {
  editingItem.value = null
  showFormModal.value = true
}

function openEditModal(item: CmsGettingStartedItem) {
  editingItem.value = item
  showFormModal.value = true
}

function openDeleteConfirm(item: CmsGettingStartedItem) {
  deletingItem.value = item
  showDeleteConfirm.value = true
}

async function handleDelete() {
  if (!deletingItem.value) return
  deleting.value = true
  await gettingStartedStore.removeItem(deletingItem.value.id)
  deleting.value = false
  showDeleteConfirm.value = false
  deletingItem.value = null
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-forge-text">Guía de inicio</h1>
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent"
        @click="openCreateModal"
      >
        <Plus class="h-4 w-4" />
        Nuevo paso
      </button>
    </div>

    <EmptyState
      v-if="gettingStartedStore.error"
      title="No se pudo cargar la guía de inicio"
      :description="gettingStartedStore.error"
    />

    <div v-else-if="gettingStartedStore.loading" class="text-sm text-forge-muted">
      Cargando…
    </div>

    <EmptyState
      v-else-if="gettingStartedStore.items.length === 0"
      title="Todavía no hay pasos en la guía"
      description="Crea el primero con el botón de arriba."
    />

    <div v-else class="overflow-hidden rounded-xl border border-forge-divider">
      <GettingStartedRow
        v-for="(item, index) in gettingStartedStore.items"
        :key="item.id"
        :item="item"
        :is-first="index === 0"
        :is-last="index === gettingStartedStore.items.length - 1"
        @edit="openEditModal(item)"
        @delete="openDeleteConfirm(item)"
        @toggle="(isActive) => gettingStartedStore.toggleActive(item.id, isActive)"
        @move-up="gettingStartedStore.moveItem(item.id, 'up')"
        @move-down="gettingStartedStore.moveItem(item.id, 'down')"
      />
    </div>

    <GettingStartedFormModal
      :open="showFormModal"
      :editing-item="editingItem"
      @close="showFormModal = false"
    />

    <ConfirmModal
      :open="showDeleteConfirm"
      title="Eliminar paso"
      :message="`¿Seguro que quieres eliminar «${deletingItem?.title ?? ''}»? Esta acción no se puede deshacer.`"
      confirm-label="Eliminar"
      :loading="deleting"
      @confirm="handleDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>
