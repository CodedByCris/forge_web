<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useCmsShopCollectionsStore } from '~/stores/cms/shopCollections.store'
import ShopCollectionRow from '~/components/cms/shop/ShopCollectionRow.vue'
import ShopCollectionFormModal from '~/components/cms/shop/ShopCollectionFormModal.vue'
import ConfirmModal from '~/components/cms/shared/ConfirmModal.vue'
import EmptyState from '~/components/cms/shared/EmptyState.vue'
import type { CmsShopCollection } from '~/types/cms/shopCollection'

definePageMeta({ layout: 'cms' })

const shopCollectionsStore = useCmsShopCollectionsStore()

const showFormModal = ref(false)
const editingCollection = ref<CmsShopCollection | null>(null)

const showDeleteConfirm = ref(false)
const deletingCollection = ref<CmsShopCollection | null>(null)
const deleting = ref(false)

onMounted(() => {
  shopCollectionsStore.fetchCollections()
})

function openCreateModal() {
  editingCollection.value = null
  showFormModal.value = true
}

function openEditModal(collection: CmsShopCollection) {
  editingCollection.value = collection
  showFormModal.value = true
}

function openDeleteConfirm(collection: CmsShopCollection) {
  deletingCollection.value = collection
  showDeleteConfirm.value = true
}

async function handleDelete() {
  if (!deletingCollection.value) return
  deleting.value = true
  await shopCollectionsStore.removeCollection(deletingCollection.value.id)
  deleting.value = false
  showDeleteConfirm.value = false
  deletingCollection.value = null
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-forge-text">Colecciones de la tienda</h1>
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent"
        @click="openCreateModal"
      >
        <Plus class="h-4 w-4" />
        Nueva colección
      </button>
    </div>

    <EmptyState
      v-if="shopCollectionsStore.error"
      title="No se pudieron cargar las colecciones"
      :description="shopCollectionsStore.error"
    />

    <div v-else-if="shopCollectionsStore.loading" class="text-sm text-forge-muted">
      Cargando…
    </div>

    <EmptyState
      v-else-if="shopCollectionsStore.collections.length === 0"
      title="Todavía no hay colecciones"
      description="Crea la primera con el botón de arriba."
    />

    <div v-else class="overflow-hidden rounded-xl border border-forge-divider">
      <ShopCollectionRow
        v-for="(collection, index) in shopCollectionsStore.collections"
        :key="collection.id"
        :collection="collection"
        :is-first="index === 0"
        :is-last="index === shopCollectionsStore.collections.length - 1"
        @edit="openEditModal(collection)"
        @delete="openDeleteConfirm(collection)"
        @toggle="(isActive) => shopCollectionsStore.toggleActive(collection.id, isActive)"
        @move-up="shopCollectionsStore.moveCollection(collection.id, 'up')"
        @move-down="shopCollectionsStore.moveCollection(collection.id, 'down')"
      />
    </div>

    <ShopCollectionFormModal
      :open="showFormModal"
      :editing-collection="editingCollection"
      @close="showFormModal = false"
    />

    <ConfirmModal
      :open="showDeleteConfirm"
      title="Eliminar colección"
      :message="`¿Seguro que quieres eliminar «${deletingCollection?.title ?? ''}»? Esta acción no se puede deshacer.`"
      confirm-label="Eliminar"
      :loading="deleting"
      @confirm="handleDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>
