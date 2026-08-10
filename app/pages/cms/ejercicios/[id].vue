<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Camera, Trash2 } from 'lucide-vue-next'
import { useCmsExercisesStore } from '~/stores/cms/exercises.store'
import EmptyState from '~/components/cms/shared/EmptyState.vue'
import {
  BODY_PARTS,
  BODY_PART_LABELS,
  EXERCISE_TYPE_LABELS,
  EQUIPMENT_OPTIONS,
  EQUIPMENT_LABELS,
  CATEGORY_OPTIONS,
  CATEGORY_LABELS,
  type CmsExerciseType,
} from '~/types/cms/exercise'

definePageMeta({ layout: 'cms' })

const route = useRoute()
const id = computed(() => route.params.id as string)

const exercisesStore = useCmsExercisesStore()

const name = ref('')
const bodyParts = ref<string[]>([])
const exerciseType = ref<CmsExerciseType>('std')
const isActive = ref(true)
const instructionStepsText = ref('')
const equipment = ref('')
const category = ref('')
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const removeImage = ref(false)
const imageInput = ref<HTMLInputElement>()

const saved = ref(false)

onMounted(async () => {
  await exercisesStore.fetchDetail(id.value)
  const ex = exercisesStore.selected
  if (ex) {
    name.value = ex.name
    bodyParts.value = [...ex.bodyParts]
    exerciseType.value = ex.exerciseType
    isActive.value = ex.isActive
    instructionStepsText.value = ex.instructionSteps.join('\n')
    equipment.value = ex.equipment ?? ''
    category.value = ex.category ?? ''
    imagePreview.value = ex.imageUrl
  }
})

function toggleBodyPart(part: string) {
  if (bodyParts.value.includes(part)) {
    bodyParts.value = bodyParts.value.filter((p) => p !== part)
  } else {
    bodyParts.value = [...bodyParts.value, part]
  }
}

function pickImage() {
  imageInput.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  if (file) {
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
    removeImage.value = false
  }
  target.value = ''
}

function handleRemoveImage() {
  imageFile.value = null
  imagePreview.value = null
  removeImage.value = true
}

async function handleSave() {
  saved.value = false
  const ok = await exercisesStore.saveDetail(
    id.value,
    {
      name: name.value.trim(),
      bodyParts: bodyParts.value,
      exerciseType: exerciseType.value,
      isActive: isActive.value,
      instructionSteps: instructionStepsText.value.split('\n').map((s) => s.trim()).filter(Boolean),
      equipment: equipment.value.trim() || null,
      category: category.value.trim() || null,
    },
    imageFile.value,
    removeImage.value,
  )
  if (ok) {
    saved.value = true
    imageFile.value = null
    removeImage.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl">
    <EmptyState
      v-if="exercisesStore.detailError"
      title="No se pudo cargar el ejercicio"
      :description="exercisesStore.detailError"
    />

    <div v-else-if="exercisesStore.detailLoading" class="text-sm text-forge-muted">
      Cargando…
    </div>

    <template v-else-if="exercisesStore.selected">
      <h1 class="mb-6 text-xl font-bold text-forge-text">Editar ejercicio</h1>

      <div class="space-y-4">
        <div>
          <label for="ex-name" class="mb-1.5 block text-xs font-medium text-forge-textSec">Nombre</label>
          <input
            id="ex-name"
            v-model="name"
            type="text"
            class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          >
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-medium text-forge-textSec">Grupos musculares</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="part in BODY_PARTS"
              :key="part"
              type="button"
              class="rounded px-2 py-1 text-xs"
              :class="bodyParts.includes(part) ? 'bg-forge-primary/10 text-forge-primary' : 'bg-forge-surfaceAlt text-forge-muted'"
              @click="toggleBodyPart(part)"
            >
              {{ BODY_PART_LABELS[part] }}
            </button>
          </div>
        </div>

        <div>
          <label for="ex-type" class="mb-1.5 block text-xs font-medium text-forge-textSec">Tipo de ejercicio</label>
          <select
            id="ex-type"
            v-model="exerciseType"
            class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          >
            <option v-for="(label, key) in EXERCISE_TYPE_LABELS" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <input id="ex-active" v-model="isActive" type="checkbox" class="h-4 w-4">
          <label for="ex-active" class="text-sm text-forge-textSec">Activo</label>
        </div>

        <div>
          <label for="ex-equipment" class="mb-1.5 block text-xs font-medium text-forge-textSec">Equipamiento</label>
          <select
            id="ex-equipment"
            v-model="equipment"
            class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          >
            <option value="">
              Sin especificar
            </option>
            <option v-for="opt in EQUIPMENT_OPTIONS" :key="opt" :value="opt">
              {{ EQUIPMENT_LABELS[opt] }}
            </option>
          </select>
        </div>

        <div>
          <label for="ex-category" class="mb-1.5 block text-xs font-medium text-forge-textSec">Categoría</label>
          <select
            id="ex-category"
            v-model="category"
            class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          >
            <option value="">
              Sin especificar
            </option>
            <option v-for="opt in CATEGORY_OPTIONS" :key="opt" :value="opt">
              {{ CATEGORY_LABELS[opt] }}
            </option>
          </select>
        </div>

        <div>
          <label for="ex-steps" class="mb-1.5 block text-xs font-medium text-forge-textSec">
            Instrucciones (un paso por línea)
          </label>
          <textarea
            id="ex-steps"
            v-model="instructionStepsText"
            rows="5"
            class="w-full resize-none rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          />
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-medium text-forge-textSec">Imagen</label>
          <div class="flex items-center gap-3">
            <div class="relative h-32 w-32 overflow-hidden rounded-lg bg-forge-surfaceAlt">
              <img
                v-if="imagePreview"
                :src="imagePreview"
                alt="Preview"
                class="h-full w-full object-cover"
              >
              <div v-else class="flex h-full w-full items-center justify-center text-forge-muted">
                <Camera :size="24" />
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <button
                type="button"
                class="flex items-center gap-1.5 rounded-lg border border-forge-divider px-3 py-1.5 text-xs font-medium text-forge-text hover:bg-forge-surfaceAlt"
                @click="pickImage"
              >
                <Camera :size="14" />
                {{ imagePreview ? 'Cambiar imagen' : 'Subir imagen' }}
              </button>
              <button
                v-if="imagePreview"
                type="button"
                class="flex items-center gap-1.5 rounded-lg border border-forge-divider px-3 py-1.5 text-xs font-medium text-forge-danger hover:bg-forge-danger/10"
                @click="handleRemoveImage"
              >
                <Trash2 :size="14" />
                Eliminar imagen
              </button>
            </div>
            <input
              ref="imageInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileChange"
            >
          </div>
        </div>

        <p v-if="exercisesStore.saveError" class="text-sm text-forge-danger">
          {{ exercisesStore.saveError }}
        </p>
        <p v-if="saved" class="text-sm text-forge-success">
          Guardado. Recuerda
          <NuxtLink to="/cms/configuracion" class="underline">
            actualizar la caché de ejercicios
          </NuxtLink>
          para que se vea en los dispositivos.
        </p>

        <button
          type="button"
          :disabled="exercisesStore.saving || !name.trim()"
          class="rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent disabled:opacity-60"
          @click="handleSave"
        >
          {{ exercisesStore.saving ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>
    </template>
  </div>
</template>
