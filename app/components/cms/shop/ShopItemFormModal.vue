<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Music, Sparkles, Trash2 } from 'lucide-vue-next'
import { useCmsShopItemsStore } from '~/stores/cms/shopItems.store'
import type { ShopItemFormInput } from '~/services/cms/shopItems.service'
import type { CmsShopItem, CmsShopItemRarity, CmsShopItemRewardType } from '~/types/cms/shopItem'
import {
  REWARD_TYPE_LABELS,
  RARITY_OPTIONS,
  RARITY_LABELS,
  THEME_OPTIONS,
  SOUND_EFFECT_OPTIONS,
} from '~/types/cms/shopItem'

const props = defineProps<{
  open: boolean
  editingItem: CmsShopItem | null
}>()

const emit = defineEmits<{
  close: []
}>()

const shopItemsStore = useCmsShopItemsStore()

const REWARD_TYPES: CmsShopItemRewardType[] = ['xpBoost', 'soundEffect', 'theme', 'celebration']

const displayName = ref('')
const price = ref(0)
const rarity = ref<CmsShopItemRarity>('common')
const minRankLevel = ref(0)
const rewardType = ref<CmsShopItemRewardType>('xpBoost')

const themeId = ref<string>(THEME_OPTIONS[0])
const boostMultiplier = ref(2)
const boostMode = ref<'hours' | 'workouts'>('workouts')
const boostDurationHours = ref(24)
const boostWorkoutsLeft = ref(5)
const soundEffect = ref<string>(SOUND_EFFECT_OPTIONS[0]!.id)

const soundFile = ref<File | null>(null)
const soundFileInput = ref<HTMLInputElement>()
const removeSound = ref(false)

const lottieFile = ref<File | null>(null)
const lottieFileInput = ref<HTMLInputElement>()
const removeLottie = ref(false)

const loading = ref(false)
const errorMessage = ref<string | null>(null)

const isEditing = computed(() => props.editingItem !== null)
const currentSoundUrl = computed(() =>
  removeSound.value ? null : (props.editingItem?.soundUrl ?? null),
)
const currentLottieUrl = computed(() =>
  removeLottie.value ? null : (props.editingItem?.celebrationLottieUrl ?? null),
)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    const item = props.editingItem
    displayName.value = item?.displayName ?? ''
    price.value = item?.price ?? 0
    rarity.value = item?.rarity ?? 'common'
    minRankLevel.value = item?.minRankLevel ?? 0
    rewardType.value = item?.rewardType ?? 'xpBoost'
    themeId.value = item?.themeId ?? THEME_OPTIONS[0]
    boostMultiplier.value = item?.boostMultiplier ?? 2
    boostMode.value = item?.boostWorkoutsLeft != null ? 'workouts' : 'hours'
    boostDurationHours.value = item?.boostDurationHours ?? 24
    boostWorkoutsLeft.value = item?.boostWorkoutsLeft ?? 5
    soundEffect.value = item?.soundEffect ?? SOUND_EFFECT_OPTIONS[0]!.id
    soundFile.value = null
    removeSound.value = false
    lottieFile.value = null
    removeLottie.value = false
    errorMessage.value = null
  },
)

function pickSoundFile() {
  soundFileInput.value?.click()
}

function handleSoundFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  if (file) {
    soundFile.value = file
    removeSound.value = false
  }
  target.value = ''
}

function handleRemoveSound() {
  soundFile.value = null
  removeSound.value = true
}

function pickLottieFile() {
  lottieFileInput.value?.click()
}

function handleLottieFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  if (file) {
    lottieFile.value = file
    removeLottie.value = false
  }
  target.value = ''
}

function handleRemoveLottie() {
  lottieFile.value = null
  removeLottie.value = true
}

const canSubmit = computed(() => {
  if (!displayName.value.trim() || price.value < 0) return false
  if (rewardType.value === 'soundEffect' && !currentSoundUrl.value && !soundFile.value) return false
  if (rewardType.value === 'celebration' && !currentLottieUrl.value && !lottieFile.value) return false
  return true
})

async function handleSubmit() {
  if (!canSubmit.value) return
  loading.value = true
  errorMessage.value = null

  const input: ShopItemFormInput = {
    displayName: displayName.value.trim(),
    price: price.value,
    rarity: rarity.value,
    minRankLevel: minRankLevel.value,
    rewardType: rewardType.value,
    themeId: rewardType.value === 'theme' ? themeId.value : null,
    boostMultiplier: rewardType.value === 'xpBoost' ? boostMultiplier.value : null,
    boostDurationHours: rewardType.value === 'xpBoost' && boostMode.value === 'hours' ? boostDurationHours.value : null,
    boostWorkoutsLeft: rewardType.value === 'xpBoost' && boostMode.value === 'workouts' ? boostWorkoutsLeft.value : null,
    soundEffect: rewardType.value === 'soundEffect' ? soundEffect.value : null,
  }

  const assetFile = rewardType.value === 'soundEffect'
    ? soundFile.value
    : rewardType.value === 'celebration'
      ? lottieFile.value
      : null
  const removeAsset = rewardType.value === 'soundEffect'
    ? removeSound.value
    : rewardType.value === 'celebration'
      ? removeLottie.value
      : false

  const ok = await shopItemsStore.saveItem(input, assetFile, removeAsset, props.editingItem?.id)
  loading.value = false
  if (ok) {
    emit('close')
  } else {
    errorMessage.value = shopItemsStore.saveError ?? 'No se pudo guardar el producto.'
  }
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
    <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-forge-divider bg-forge-surface p-6">
      <h2 class="text-lg font-semibold text-forge-text">
        {{ isEditing ? 'Editar producto' : 'Nuevo producto' }}
      </h2>

      <div class="mt-4 space-y-4">
        <div>
          <label for="si-name" class="mb-1.5 block text-xs font-medium text-forge-textSec">Nombre</label>
          <input
            id="si-name"
            v-model="displayName"
            type="text"
            class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          >
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="si-price" class="mb-1.5 block text-xs font-medium text-forge-textSec">Precio (mancuernitas)</label>
            <input
              id="si-price"
              v-model.number="price"
              type="number"
              min="0"
              class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
            >
          </div>
          <div>
            <label for="si-min-level" class="mb-1.5 block text-xs font-medium text-forge-textSec">Nivel mínimo</label>
            <input
              id="si-min-level"
              v-model.number="minRankLevel"
              type="number"
              min="0"
              class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
            >
          </div>
        </div>

        <div>
          <label for="si-rarity" class="mb-1.5 block text-xs font-medium text-forge-textSec">Rareza</label>
          <select
            id="si-rarity"
            v-model="rarity"
            class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          >
            <option v-for="opt in RARITY_OPTIONS" :key="opt" :value="opt">
              {{ RARITY_LABELS[opt] }}
            </option>
          </select>
        </div>

        <div>
          <label for="si-reward-type" class="mb-1.5 block text-xs font-medium text-forge-textSec">
            Tipo de recompensa
          </label>
          <select
            id="si-reward-type"
            v-model="rewardType"
            :disabled="isEditing"
            class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary disabled:opacity-60"
          >
            <option v-for="opt in REWARD_TYPES" :key="opt" :value="opt">
              {{ REWARD_TYPE_LABELS[opt] }}
            </option>
          </select>
          <p v-if="isEditing" class="mt-1 text-xs text-forge-muted">
            El tipo no se puede cambiar una vez creado el producto.
          </p>
        </div>

        <!-- Impulso de XP -->
        <template v-if="rewardType === 'xpBoost'">
          <div>
            <label for="si-multiplier" class="mb-1.5 block text-xs font-medium text-forge-textSec">
              Multiplicador (ej. 2 = ×2 XP)
            </label>
            <input
              id="si-multiplier"
              v-model.number="boostMultiplier"
              type="number"
              min="1"
              step="0.1"
              class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
            >
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-forge-textSec">Duración</label>
            <div class="flex gap-4 text-sm text-forge-text">
              <label class="flex items-center gap-1.5">
                <input v-model="boostMode" type="radio" value="workouts">
                Por entrenamientos
              </label>
              <label class="flex items-center gap-1.5">
                <input v-model="boostMode" type="radio" value="hours">
                Por horas
              </label>
            </div>
          </div>
          <div v-if="boostMode === 'workouts'">
            <label for="si-workouts" class="mb-1.5 block text-xs font-medium text-forge-textSec">
              Nº de entrenamientos
            </label>
            <input
              id="si-workouts"
              v-model.number="boostWorkoutsLeft"
              type="number"
              min="1"
              class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
            >
          </div>
          <div v-else>
            <label for="si-hours" class="mb-1.5 block text-xs font-medium text-forge-textSec">Horas</label>
            <input
              id="si-hours"
              v-model.number="boostDurationHours"
              type="number"
              min="1"
              class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
            >
          </div>
        </template>

        <!-- Efecto de sonido -->
        <template v-else-if="rewardType === 'soundEffect'">
          <div>
            <label for="si-sound-slot" class="mb-1.5 block text-xs font-medium text-forge-textSec">
              Sustituye al sonido de
            </label>
            <select
              id="si-sound-slot"
              v-model="soundEffect"
              class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
            >
              <option v-for="opt in SOUND_EFFECT_OPTIONS" :key="opt.id" :value="opt.id">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-forge-textSec">Archivo de audio</label>
            <div class="flex items-center gap-3">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-forge-surfaceAlt">
                <Music :size="20" class="text-forge-muted" />
              </div>
              <div class="flex flex-1 flex-col gap-2">
                <audio v-if="currentSoundUrl" :src="currentSoundUrl" controls class="h-8 w-full" />
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="flex items-center gap-1.5 rounded-lg border border-forge-divider px-3 py-1.5 text-xs font-medium text-forge-text hover:bg-forge-surfaceAlt"
                    @click="pickSoundFile"
                  >
                    <Music :size="14" />
                    {{ currentSoundUrl ? 'Cambiar audio' : 'Subir audio' }}
                  </button>
                  <button
                    v-if="currentSoundUrl"
                    type="button"
                    class="flex items-center gap-1.5 rounded-lg border border-forge-divider px-3 py-1.5 text-xs font-medium text-forge-danger hover:bg-forge-danger/10"
                    @click="handleRemoveSound"
                  >
                    <Trash2 :size="14" />
                    Eliminar
                  </button>
                </div>
                <p v-if="soundFile" class="text-xs text-forge-muted">{{ soundFile.name }}</p>
              </div>
              <input
                ref="soundFileInput"
                type="file"
                accept="audio/*"
                class="hidden"
                @change="handleSoundFileChange"
              >
            </div>
          </div>
        </template>

        <!-- Tema -->
        <template v-else-if="rewardType === 'theme'">
          <div>
            <label for="si-theme" class="mb-1.5 block text-xs font-medium text-forge-textSec">Tema</label>
            <select
              id="si-theme"
              v-model="themeId"
              :disabled="isEditing"
              class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary disabled:opacity-60"
            >
              <option v-for="opt in THEME_OPTIONS" :key="opt" :value="opt">
                {{ opt }}
              </option>
            </select>
            <p v-if="!isEditing" class="mt-1 text-xs text-forge-muted">
              Solo puede haber un producto por tema.
            </p>
          </div>
        </template>

        <!-- Celebración -->
        <template v-else-if="rewardType === 'celebration'">
          <div>
            <label class="mb-1.5 block text-xs font-medium text-forge-textSec">Animación Lottie (.json)</label>
            <div class="flex items-center gap-3">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-forge-surfaceAlt">
                <Sparkles :size="20" class="text-forge-muted" />
              </div>
              <div class="flex flex-1 flex-col gap-2">
                <p v-if="currentLottieUrl" class="text-xs text-forge-success">Lottie subido ✓</p>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="flex items-center gap-1.5 rounded-lg border border-forge-divider px-3 py-1.5 text-xs font-medium text-forge-text hover:bg-forge-surfaceAlt"
                    @click="pickLottieFile"
                  >
                    <Sparkles :size="14" />
                    {{ currentLottieUrl ? 'Cambiar Lottie' : 'Subir Lottie' }}
                  </button>
                  <button
                    v-if="currentLottieUrl"
                    type="button"
                    class="flex items-center gap-1.5 rounded-lg border border-forge-divider px-3 py-1.5 text-xs font-medium text-forge-danger hover:bg-forge-danger/10"
                    @click="handleRemoveLottie"
                  >
                    <Trash2 :size="14" />
                    Eliminar
                  </button>
                </div>
                <p v-if="lottieFile" class="text-xs text-forge-muted">{{ lottieFile.name }}</p>
              </div>
              <input
                ref="lottieFileInput"
                type="file"
                accept="application/json,.json"
                class="hidden"
                @change="handleLottieFileChange"
              >
            </div>
          </div>
        </template>
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
