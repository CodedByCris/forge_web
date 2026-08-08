import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CmsFaq } from '~/types/cms/faq'
import {
  getFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  toggleFaqActive,
} from '~/services/cms/faq.service'

export const useCmsFaqStore = defineStore('cmsFaq', () => {
  const faqs = ref<CmsFaq[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchFaqs(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      faqs.value = await getFaqs()
    } catch {
      error.value = 'No se pudieron cargar las preguntas frecuentes.'
    } finally {
      loading.value = false
    }
  }

  async function saveFaq(question: string, answer: string, id?: string): Promise<boolean> {
    try {
      if (id) {
        await updateFaq(id, question, answer)
      } else {
        await createFaq(question, answer)
      }
      await fetchFaqs()
      return true
    } catch {
      return false
    }
  }

  async function removeFaq(id: string): Promise<boolean> {
    try {
      await deleteFaq(id)
      faqs.value = faqs.value.filter((f) => f.id !== id)
      return true
    } catch {
      return false
    }
  }

  async function toggleActive(id: string, isActive: boolean): Promise<boolean> {
    try {
      await toggleFaqActive(id, isActive)
      const faq = faqs.value.find((f) => f.id === id)
      if (faq) faq.isActive = isActive
      return true
    } catch {
      return false
    }
  }

  return {
    faqs,
    loading,
    error,
    fetchFaqs,
    saveFaq,
    removeFaq,
    toggleActive,
  }
})
