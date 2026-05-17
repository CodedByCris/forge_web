import { defineStore } from 'pinia'
import { templateService } from '~/services/template.service'
import type { WorkoutTemplate, PlannedExercise } from '~/types/template'

export const useTemplateStore = defineStore('templates', () => {
  const templates = ref<WorkoutTemplate[]>([])
  const loading = ref(false)
  let unsub: (() => void) | null = null

  const canCreateMore = computed(() => templates.value.length < 5)

  function subscribe(userId: string): void {
    unsub?.()
    loading.value = true
    unsub = templateService.watchTemplates(userId, (data) => {
      templates.value = data
      loading.value = false
    })
  }

  function unsubscribe(): void {
    unsub?.()
    unsub = null
  }

  async function createTemplate(
    userId: string,
    params: { name: string; color: number; exercises: PlannedExercise[] },
  ): Promise<string> {
    if (!canCreateMore.value) throw new Error('max_templates')
    return await templateService.createTemplate(userId, params)
  }

  async function updateTemplate(
    userId: string,
    id: string,
    params: { name: string; color: number; exercises: PlannedExercise[] },
  ): Promise<void> {
    await templateService.updateTemplate(userId, id, params)
  }

  async function deleteTemplate(userId: string, id: string): Promise<void> {
    await templateService.deleteTemplate(userId, id)
  }

  return {
    templates,
    loading,
    canCreateMore,
    subscribe,
    unsubscribe,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  }
})
