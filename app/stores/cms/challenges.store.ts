import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CmsChallenge, CmsChallengeInput } from '~/types/cms/challenge'
import {
  getChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  toggleChallengeActive,
} from '~/services/cms/challenges.service'

export const useCmsChallengesStore = defineStore('cmsChallenges', () => {
  const challenges = ref<CmsChallenge[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchChallenges(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      challenges.value = await getChallenges()
    } catch {
      error.value = 'No se pudieron cargar los retos.'
    } finally {
      loading.value = false
    }
  }

  async function saveChallenge(input: CmsChallengeInput, id?: string): Promise<boolean> {
    try {
      if (id) {
        await updateChallenge(id, input)
      } else {
        await createChallenge(input)
      }
      await fetchChallenges()
      return true
    } catch {
      return false
    }
  }

  async function removeChallenge(id: string): Promise<boolean> {
    try {
      await deleteChallenge(id)
      challenges.value = challenges.value.filter((c) => c.id !== id)
      return true
    } catch {
      return false
    }
  }

  async function toggleActive(id: string, isActive: boolean): Promise<boolean> {
    try {
      await toggleChallengeActive(id, isActive)
      const challenge = challenges.value.find((c) => c.id === id)
      if (challenge) challenge.isActive = isActive
      return true
    } catch {
      return false
    }
  }

  return { challenges, loading, error, fetchChallenges, saveChallenge, removeChallenge, toggleActive }
})
