import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CmsDashboardStats } from '~/services/cms/dashboard.service'
import { getDashboardStats } from '~/services/cms/dashboard.service'

export const useCmsDashboardStore = defineStore('cmsDashboard', () => {
  const stats = ref<CmsDashboardStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchStats(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      stats.value = await getDashboardStats()
    } catch {
      error.value = 'No se pudieron cargar las estadísticas.'
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    loading,
    error,
    fetchStats,
  }
})
