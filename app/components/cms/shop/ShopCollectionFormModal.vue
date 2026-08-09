<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useCmsShopCollectionsStore } from '~/stores/cms/shopCollections.store'
import { useCmsShopItemsStore } from '~/stores/cms/shopItems.store'
import type { ShopCollectionFormInput } from '~/services/cms/shopCollections.service'
import type { CmsShopCollection } from '~/types/cms/shopCollection'
import { REWARD_TYPE_LABELS, REWARD_TYPE_ORDER, RARITY_LABELS } from '~/types/cms/shopItem'

const props = defineProps<{
  open: boolean
  editingCollection: CmsShopCollection | null
}>()

const emit = defineEmits<{
  close: []
}>()

const shopCollectionsStore = useCmsShopCollectionsStore()
const shopItemsStore = useCmsShopItemsStore()

const title = ref('')
const titleEn = ref('')
const badge = ref('')
const badgeEn = ref('')
const selectedItemIds = ref<Set<string>>(new Set())

const loading = ref(false)
const errorMessage = ref<string | null>(null)

const isEditing = computed(() => props.editingCollection !== null)

const itemSections = computed(() =>
  REWARD_TYPE_ORDER
    .map((rewardType) => ({
      rewardType,
      label: REWARD_TYPE_LABELS[rewardType],
      items: shopItemsStore.items.filter((i) => i.rewardType === rewardType),
    }))
    .filter((section) => section.items.length > 0),
)

onMounted(() => {
  if (shopItemsStore.items.length === 0) {
    shopItemsStore.fetchItems()
  }
})

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    const c = props.editingCollection
    title.value = c?.title ?? ''
    titleEn.value = c?.titleEn ?? ''
    badge.value = c?.badge ?? ''
    badgeEn.value = c?.badgeEn ?? ''
    selectedItemIds.value = new Set(c?.itemIds ?? [])
    errorMessage.value = null
  },
)

function toggleItem(id: string) {
  const next = new Set(selectedItemIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  selectedItemIds.value = next
}

const canSubmit = computed(() => title.value.trim().length > 0 && selectedItemIds.value.size > 0)

async function handleSubmit() {
  if (!canSubmit.value) return
  loading.value = true
  errorMessage.value = null

  const input: ShopCollectionFormInput = {
    title: title.value.trim(),
    titleEn: titleEn.value.trim() || title.value.trim(),
    badge: badge.value.trim(),
    badgeEn: badgeEn.value.trim() || badge.value.trim(),
    itemIds: [...selectedItemIds.value],
  }

  const ok = await shopCollectionsStore.saveCollection(input, props.editingCollection?.id)
  loading.value = false
  if (ok) {
    emit('close')
  } else {
    errorMessage.value = shopCollectionsStore.saveError ?? 'No se pudo guardar la colección.'
  }
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
    <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-forge-divider bg-forge-surface p-6">
      <h2 class="text-lg font-semibold text-forge-text">
        {{ isEditing ? 'Editar colección' : 'Nueva colección' }}
      </h2>

      <div class="mt-4 space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="sc-title" class="mb-1.5 block text-xs font-medium text-forge-textSec">Título (ES)</label>
            <input
              id="sc-title"
              v-model="title"
              type="text"
              class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
            >
          </div>
          <div>
            <label for="sc-title-en" class="mb-1.5 block text-xs font-medium text-forge-textSec">Título (EN)</label>
            <input
              id="sc-title-en"
              v-model="titleEn"
              type="text"
              placeholder="Igual que ES si se deja vacío"
              class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
            >
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="sc-badge" class="mb-1.5 block text-xs font-medium text-forge-textSec">Badge (ES)</label>
            <input
              id="sc-badge"
              v-model="badge"
              type="text"
              placeholder="ej. COMÚN"
              class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
            >
          </div>
          <div>
            <label for="sc-badge-en" class="mb-1.5 block text-xs font-medium text-forge-textSec">Badge (EN)</label>
            <input
              id="sc-badge-en"
              v-model="badgeEn"
              type="text"
              placeholder="Igual que ES si se deja vacío"
              class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
            >
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-medium text-forge-textSec">
            Productos incluidos ({{ selectedItemIds.size }})
          </label>
          <div class="max-h-64 overflow-y-auto rounded-lg border border-forge-divider bg-forge-surfaceAlt p-2">
            <div v-if="shopItemsStore.loading" class="px-2 py-1 text-xs text-forge-muted">
              Cargando productos…
            </div>
            <div v-for="section in itemSections" :key="section.rewardType" class="mb-2 last:mb-0">
              <p class="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-forge-muted">
                {{ section.label }}
              </p>
              <label
                v-for="item in section.items"
                :key="item.id"
                class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-forge-text hover:bg-forge-surface"
              >
                <input
                  type="checkbox"
                  :checked="selectedItemIds.has(item.id)"
                  @change="toggleItem(item.id)"
                >
                <span class="min-w-0 flex-1 truncate">{{ item.displayName }}</span>
                <span class="shrink-0 text-xs text-forge-muted">{{ RARITY_LABELS[item.rarity] }}</span>
                <span v-if="!item.isActive" class="shrink-0 text-[10px] uppercase text-forge-muted">inactivo</span>
              </label>
            </div>
          </div>
        </div>
      </div>

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
          :disabled="loading || !canSubmit"
          class="rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent disabled:opacity-60"
          @click="handleSubmit"
        >
          {{ loading ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>
