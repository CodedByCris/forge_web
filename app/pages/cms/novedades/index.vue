<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, RotateCcw } from 'lucide-vue-next'
import { useCmsWhatsNewStore } from '~/stores/cms/whatsNew.store'
import WhatsNewRow from '~/components/cms/whatsNew/WhatsNewRow.vue'
import WhatsNewFormModal from '~/components/cms/whatsNew/WhatsNewFormModal.vue'
import ConfirmModal from '~/components/cms/shared/ConfirmModal.vue'
import EmptyState from '~/components/cms/shared/EmptyState.vue'
import type { CmsWhatsNewItem } from '~/types/cms/whatsNew'

definePageMeta({ layout: 'cms' })

const whatsNewStore = useCmsWhatsNewStore()

const showFormModal = ref(false)
const editingItem = ref<CmsWhatsNewItem | null>(null)

const showDeleteConfirm = ref(false)
const deletingItem = ref<CmsWhatsNewItem | null>(null)
const deleting = ref(false)

const showForceConfirm = ref(false)

onMounted(() => {
  whatsNewStore.fetchItems()
  whatsNewStore.fetchVersion()
})

function openCreateModal() {
  editingItem.value = null
  showFormModal.value = true
}

function openEditModal(item: CmsWhatsNewItem) {
  editingItem.value = item
  showFormModal.value = true
}

function openDeleteConfirm(item: CmsWhatsNewItem) {
  deletingItem.value = item
  showDeleteConfirm.value = true
}

async function handleDelete() {
  if (!deletingItem.value) return
  deleting.value = true
  await whatsNewStore.removeItem(deletingItem.value.id)
  deleting.value = false
  showDeleteConfirm.value = false
  deletingItem.value = null
}

async function handleForceReappear() {
  await whatsNewStore.forceReappear()
  showForceConfirm.value = false
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-forge-text">Novedades</h1>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="flex items-center gap-2 rounded-lg border border-forge-divider px-4 py-2 text-sm font-medium text-forge-textSec hover:bg-forge-surfaceAlt"
          @click="showForceConfirm = true"
        >
          <RotateCcw class="h-4 w-4" />
          Forzar reaparición
        </button>
        <button
          type="button"
          class="flex items-center gap-2 rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent"
          @click="openCreateModal"
        >
          <Plus class="h-4 w-4" />
          Nueva pantalla
        </button>
      </div>
    </div>

    <EmptyState
      v-if="whatsNewStore.error"
      title="No se pudieron cargar las Novedades"
      :description="whatsNewStore.error"
    />

    <div v-else-if="whatsNewStore.loading" class="text-sm text-forge-muted">
      Cargando…
    </div>

    <EmptyState
      v-else-if="whatsNewStore.items.length === 0"
      title="Todavía no hay pantallas de Novedades"
      description="Crea la primera con el botón de arriba."
    />

    <div v-else class="overflow-hidden rounded-xl border border-forge-divider">
      <WhatsNewRow
        v-for="(item, index) in whatsNewStore.items"
        :key="item.id"
        :item="item"
        :is-first="index === 0"
        :is-last="index === whatsNewStore.items.length - 1"
        @edit="openEditModal(item)"
        @delete="openDeleteConfirm(item)"
        @toggle="(isActive) => whatsNewStore.toggleActive(item.id, isActive)"
        @move-up="whatsNewStore.moveItem(item.id, 'up')"
        @move-down="whatsNewStore.moveItem(item.id, 'down')"
      />
    </div>

    <WhatsNewFormModal
      :open="showFormModal"
      :editing-item="editingItem"
      @close="showFormModal = false"
    />

    <ConfirmModal
      :open="showDeleteConfirm"
      title="Eliminar pantalla"
      :message="`¿Seguro que quieres eliminar «${deletingItem?.title ?? ''}»? Esta acción no se puede deshacer.`"
      confirm-label="Eliminar"
      :loading="deleting"
      @confirm="handleDelete"
      @cancel="showDeleteConfirm = false"
    />

    <ConfirmModal
      :open="showForceConfirm"
      title="Forzar reaparición"
      :message="`Todos los usuarios volverán a ver las Novedades la próxima vez que abran la app (versión actual: ${whatsNewStore.version}). ¿Continuar?`"
      confirm-label="Forzar"
      :loading="whatsNewStore.forcing"
      @confirm="handleForceReappear"
      @cancel="showForceConfirm = false"
    />
  </div>
</template>
