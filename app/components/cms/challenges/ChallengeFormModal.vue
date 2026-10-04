<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCmsChallengesStore } from '~/stores/cms/challenges.store'
import {
  CHALLENGE_TYPE_LABELS,
  type CmsChallenge,
  type CmsChallengeType,
} from '~/types/cms/challenge'

const props = defineProps<{
  open: boolean
  editingChallenge: CmsChallenge | null
}>()

const emit = defineEmits<{
  close: []
}>()

const store = useCmsChallengesStore()

const title = ref('')
const description = ref('')
const type = ref<CmsChallengeType>('workouts')
const target = ref(1)
const rewardCoins = ref(0)
const rewardXp = ref(0)
const startsAt = ref('')
const endsAt = ref('')
const imageUrl = ref('')
const loading = ref(false)
const errorMessage = ref<string | null>(null)

const typeOptions = Object.entries(CHALLENGE_TYPE_LABELS) as [CmsChallengeType, string][]

// Fechas como yyyy-mm-dd en hora local (el input type="date" no usa UTC).
function toInputDate(date: Date | null): string {
  if (!date) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    const c = props.editingChallenge
    title.value = c?.title ?? ''
    description.value = c?.description ?? ''
    type.value = c?.type ?? 'workouts'
    target.value = c?.target ?? 1
    rewardCoins.value = c?.rewardCoins ?? 0
    rewardXp.value = c?.rewardXp ?? 0
    startsAt.value = toInputDate(c?.startsAt ?? null)
    endsAt.value = toInputDate(c?.endsAt ?? null)
    imageUrl.value = c?.imageUrl ?? ''
    errorMessage.value = null
  },
)

const isValid = computed(
  () =>
    title.value.trim() !== '' &&
    target.value > 0 &&
    rewardCoins.value >= 0 &&
    rewardXp.value >= 0 &&
    startsAt.value !== '' &&
    endsAt.value !== '' &&
    endsAt.value >= startsAt.value,
)

async function handleSubmit() {
  if (!isValid.value) return
  loading.value = true
  errorMessage.value = null
  // El reto termina al final del día de `endsAt`.
  const start = new Date(`${startsAt.value}T00:00:00`)
  const end = new Date(`${endsAt.value}T23:59:59`)
  const saveError = await store.saveChallenge(
    {
      title: title.value.trim(),
      description: description.value.trim(),
      type: type.value,
      target: target.value,
      rewardCoins: rewardCoins.value,
      rewardXp: rewardXp.value,
      startsAt: start,
      endsAt: end,
      imageUrl: imageUrl.value.trim() || null,
    },
    props.editingChallenge?.id,
  )
  loading.value = false
  if (saveError === null) {
    emit('close')
  } else {
    errorMessage.value = `No se pudo guardar el reto. ${saveError}`
  }
}

const inputClass =
  'w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary'
const labelClass = 'mb-1.5 block text-xs font-medium text-forge-textSec'
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-6">
    <div class="w-full max-w-lg rounded-2xl border border-forge-divider bg-forge-surface p-6">
      <h2 class="text-lg font-semibold text-forge-text">
        {{ editingChallenge ? 'Editar reto' : 'Nuevo reto' }}
      </h2>

      <div class="mt-4 space-y-4">
        <div>
          <label for="ch-title" :class="labelClass">Título</label>
          <input id="ch-title" v-model="title" type="text" :class="inputClass">
        </div>
        <div>
          <label for="ch-desc" :class="labelClass">Descripción</label>
          <textarea id="ch-desc" v-model="description" rows="2" :class="[inputClass, 'resize-none']" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="ch-type" :class="labelClass">Tipo</label>
            <select id="ch-type" v-model="type" :class="inputClass">
              <option v-for="[value, label] in typeOptions" :key="value" :value="value">{{ label }}</option>
            </select>
          </div>
          <div>
            <label for="ch-target" :class="labelClass">Meta</label>
            <input id="ch-target" v-model.number="target" type="number" min="1" :class="inputClass">
          </div>
          <div>
            <label for="ch-coins" :class="labelClass">Recompensa (monedas)</label>
            <input id="ch-coins" v-model.number="rewardCoins" type="number" min="0" :class="inputClass">
          </div>
          <div>
            <label for="ch-xp" :class="labelClass">Recompensa (XP)</label>
            <input id="ch-xp" v-model.number="rewardXp" type="number" min="0" :class="inputClass">
          </div>
          <div>
            <label for="ch-start" :class="labelClass">Inicio</label>
            <input id="ch-start" v-model="startsAt" type="date" :class="inputClass">
          </div>
          <div>
            <label for="ch-end" :class="labelClass">Fin (incluido)</label>
            <input id="ch-end" v-model="endsAt" type="date" :class="inputClass">
          </div>
        </div>
        <div>
          <label for="ch-image" :class="labelClass">URL de imagen (opcional)</label>
          <input id="ch-image" v-model="imageUrl" type="url" :class="inputClass">
        </div>
      </div>

      <p v-if="errorMessage" class="mt-4 text-sm text-forge-danger">{{ errorMessage }}</p>

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
          :disabled="loading || !isValid"
          class="rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent disabled:opacity-60"
          @click="handleSubmit"
        >
          {{ loading ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>
