<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useCmsShopItemsStore } from '~/stores/cms/shopItems.store'
import ShopItemRow from '~/components/cms/shop/ShopItemRow.vue'
import ShopItemFormModal from '~/components/cms/shop/ShopItemFormModal.vue'
import ConfirmModal from '~/components/cms/shared/ConfirmModal.vue'
import EmptyState from '~/components/cms/shared/EmptyState.vue'
import type { CmsShopItem, CmsShopItemRewardType } from '~/types/cms/shopItem'
import { REWARD_TYPE_LABELS } from '~/types/cms/shopItem'

definePageMeta({ layout: 'cms' })

const shopItemsStore = useCmsShopItemsStore()

const typeFilter = ref<CmsShopItemRewardType | 'all'>('all')

const filteredItems = computed(() =>
  typeFilter.value === 'all'
    ? shopItemsStore.items
    : shopItemsStore.items.filter((i) => i.rewardType === typeFilter.value),
)

const showFormModal = ref(false)
const editingItem = ref<CmsShopItem | null>(null)

const showDeleteConfirm = ref(false)
const deletingItem = ref<CmsShopItem | null>(null)
const deleting = ref(false)

onMounted(() => {
  shopItemsStore.fetchItems()
})

function openCreateModal() {
  editingItem.value = null
  showFormModal.value = true
}

function openEditModal(item: CmsShopItem) {
  editingItem.value = item
  showFormModal.value = true
}

function openDeleteConfirm(item: CmsShopItem) {
  deletingItem.value = item
  showDeleteConfirm.value = true
}

async function handleDelete() {
  if (!deletingItem.value) return
  deleting.value = true
  await shopItemsStore.removeItem(deletingItem.value.id)
  deleting.value = false
  showDeleteConfirm.value = false
  deletingItem.value = null
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-forge-text">Tienda</h1>
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent"
        @click="openCreateModal"
      >
        <Plus class="h-4 w-4" />
        Nuevo producto
      </button>
    </div>

    <div class="mb-4">
      <select
        v-model="typeFilter"
        class="rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
      >
        <option value="all">
          Todos los tipos
        </option>
        <option value="xpBoost">
          {{ REWARD_TYPE_LABELS.xpBoost }}
        </option>
        <option value="soundEffect">
          {{ REWARD_TYPE_LABELS.soundEffect }}
        </option>
        <option value="theme">
          {{ REWARD_TYPE_LABELS.theme }}
        </option>
        <option value="celebration">
          {{ REWARD_TYPE_LABELS.celebration }}
        </option>
      </select>
    </div>

    <EmptyState
      v-if="shopItemsStore.error"
      title="No se pudieron cargar los productos"
      :description="shopItemsStore.error"
    />

    <div v-else-if="shopItemsStore.loading" class="text-sm text-forge-muted">
      Cargando…
    </div>

    <EmptyState
      v-else-if="filteredItems.length === 0"
      title="No hay productos"
      description="Crea el primero con el botón de arriba."
    />

    <div v-else class="overflow-hidden rounded-xl border border-forge-divider">
      <ShopItemRow
        v-for="item in filteredItems"
        :key="item.id"
        :item="item"
        @edit="openEditModal(item)"
        @delete="openDeleteConfirm(item)"
        @toggle="(isActive) => shopItemsStore.toggleActive(item.id, isActive)"
      />
    </div>

    <ShopItemFormModal
      :open="showFormModal"
      :editing-item="editingItem"
      @close="showFormModal = false"
    />

    <ConfirmModal
      :open="showDeleteConfirm"
      title="Eliminar producto"
      :message="`¿Seguro que quieres eliminar «${deletingItem?.displayName ?? ''}»? Esta acción no se puede deshacer.`"
      confirm-label="Eliminar"
      :loading="deleting"
      @confirm="handleDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>
