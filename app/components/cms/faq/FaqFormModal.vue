<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCmsFaqStore } from '~/stores/cms/faq.store'
import type { CmsFaq } from '~/types/cms/faq'

const props = defineProps<{
  open: boolean
  editingFaq: CmsFaq | null
}>()

const emit = defineEmits<{
  close: []
}>()

const faqStore = useCmsFaqStore()

const question = ref('')
const answer = ref('')
const loading = ref(false)
const errorMessage = ref<string | null>(null)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      question.value = props.editingFaq?.question ?? ''
      answer.value = props.editingFaq?.answer ?? ''
      errorMessage.value = null
    }
  },
)

async function handleSubmit() {
  if (!question.value.trim() || !answer.value.trim()) return
  loading.value = true
  errorMessage.value = null
  const ok = await faqStore.saveFaq(question.value.trim(), answer.value.trim(), props.editingFaq?.id)
  loading.value = false
  if (ok) {
    emit('close')
  } else {
    errorMessage.value = 'No se pudo guardar la pregunta frecuente.'
  }
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
    <div class="w-full max-w-lg rounded-2xl border border-forge-divider bg-forge-surface p-6">
      <h2 class="text-lg font-semibold text-forge-text">
        {{ editingFaq ? 'Editar pregunta frecuente' : 'Nueva pregunta frecuente' }}
      </h2>

      <div class="mt-4 space-y-4">
        <div>
          <label for="faq-question" class="mb-1.5 block text-xs font-medium text-forge-textSec">
            Pregunta
          </label>
          <textarea
            id="faq-question"
            v-model="question"
            rows="2"
            class="w-full resize-none rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          />
        </div>
        <div>
          <label for="faq-answer" class="mb-1.5 block text-xs font-medium text-forge-textSec">
            Respuesta
          </label>
          <textarea
            id="faq-answer"
            v-model="answer"
            rows="4"
            class="w-full resize-none rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          />
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
          :disabled="loading || !question.trim() || !answer.trim()"
          class="rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent disabled:opacity-60"
          @click="handleSubmit"
        >
          {{ loading ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>
