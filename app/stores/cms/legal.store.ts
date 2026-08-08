import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CmsLegalDocument, CmsLegalDocumentId } from '~/types/cms/legal'
import { getLegalDocuments, saveLegalDocument } from '~/services/cms/legal.service'

export const useCmsLegalStore = defineStore('cmsLegal', () => {
  const documents = ref<CmsLegalDocument[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDocuments(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      documents.value = await getLegalDocuments()
    } catch {
      error.value = 'No se pudieron cargar los documentos legales.'
    } finally {
      loading.value = false
    }
  }

  async function saveDocument(id: CmsLegalDocumentId, contentHtml: string): Promise<boolean> {
    const current = documents.value.find((d) => d.id === id)
    try {
      await saveLegalDocument(id, contentHtml, current?.version ?? 0)
      await fetchDocuments()
      return true
    } catch {
      return false
    }
  }

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    saveDocument,
  }
})
