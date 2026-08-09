<script setup lang="ts">
import { ref, watch } from 'vue'
import { Camera, Trash2 } from 'lucide-vue-next'
import { useCmsGettingStartedStore } from '~/stores/cms/gettingStarted.store'
import type { CmsGettingStartedItem } from '~/types/cms/gettingStarted'

const props = defineProps<{
  open: boolean
  editingItem: CmsGettingStartedItem | null
}>()

const emit = defineEmits<{
  close: []
}>()

const gettingStartedStore = useCmsGettingStartedStore()

const title = ref('')
const description = ref('')
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const removeImage = ref(false)
const imageInput = ref<HTMLInputElement>()
const loading = ref(false)
const errorMessage = ref<string | null>(null)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      title.value = props.editingItem?.title ?? ''
      description.value = props.editingItem?.description ?? ''
      imagePreview.value = props.editingItem?.imageUrl ?? null
      imageFile.value = null
      removeImage.value = false
      errorMessage.value = null
    }
  },
)

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

async function handleSubmit() {
  if (!title.value.trim() || !description.value.trim()) return
  loading.value = true
  errorMessage.value = null
  const ok = await gettingStartedStore.saveItem(
    title.value.trim(),
    description.value.trim(),
    imageFile.value,
    removeImage.value,
    props.editingItem?.id,
  )
  loading.value = false
  if (ok) {
    emit('close')
  } else {
    errorMessage.value = gettingStartedStore.saveError ?? 'No se pudo guardar el paso.'
  }
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
    <div class="w-full max-w-lg rounded-2xl border border-forge-divider bg-forge-surface p-6">
      <h2 class="text-lg font-semibold text-forge-text">
        {{ editingItem ? 'Editar paso' : 'Nuevo paso' }}
      </h2>

      <div class="mt-4 space-y-4">
        <div>
          <label for="gs-title" class="mb-1.5 block text-xs font-medium text-forge-textSec">
            Título
          </label>
          <input
            id="gs-title"
            v-model="title"
            type="text"
            class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          >
        </div>
        <div>
          <label for="gs-description" class="mb-1.5 block text-xs font-medium text-forge-textSec">
            Descripción
          </label>
          <textarea
            id="gs-description"
            v-model="description"
            rows="3"
            class="w-full resize-none rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          />
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-medium text-forge-textSec">Imagen (opcional)</label>
          <div class="flex items-center gap-3">
            <div class="relative h-24 w-24 overflow-hidden rounded-lg bg-forge-surfaceAlt">
              <img
                v-if="imagePreview"
                :src="imagePreview"
                alt="Preview"
                class="h-full w-full object-cover"
              >
              <div v-else class="flex h-full w-full items-center justify-center text-forge-muted">
                <Camera :size="20" />
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
          :disabled="loading || !title.trim() || !description.trim()"
          class="rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent disabled:opacity-60"
          @click="handleSubmit"
        >
          {{ loading ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>
