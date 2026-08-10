import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CmsUser, CmsWorkoutSummary } from '~/types/cms/user'
import {
  getUsers,
  getUserWorkouts,
  adjustUserXpCoins,
  resetUserStreak,
  adminDeleteUser,
} from '~/services/cms/users.service'

export interface DeleteUserOutcome {
  ok: boolean
  failedSteps: string[]
}

export const useCmsUsersStore = defineStore('cmsUsers', () => {
  const users = ref<CmsUser[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const selectedUser = ref<CmsUser | null>(null)
  const selectedUserWorkouts = ref<CmsWorkoutSummary[]>([])
  const detailLoading = ref(false)
  const detailError = ref<string | null>(null)

  async function fetchUsers(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      users.value = await getUsers()
    } catch {
      error.value = 'No se pudieron cargar los usuarios.'
    } finally {
      loading.value = false
    }
  }

  async function fetchUserDetail(uid: string): Promise<void> {
    detailLoading.value = true
    detailError.value = null
    try {
      if (users.value.length === 0) {
        await fetchUsers()
      }
      selectedUser.value = users.value.find((u) => u.uid === uid) ?? null
      selectedUserWorkouts.value = await getUserWorkouts(uid)
    } catch {
      detailError.value = 'No se pudo cargar el detalle del usuario.'
    } finally {
      detailLoading.value = false
    }
  }

  async function adjustXpCoins(uid: string, deltaXp: number, deltaCoins: number): Promise<boolean> {
    try {
      await adjustUserXpCoins(uid, deltaXp, deltaCoins)
      if (selectedUser.value?.uid === uid) {
        selectedUser.value.totalXp += deltaXp
        selectedUser.value.coins += deltaCoins
      }
      return true
    } catch {
      return false
    }
  }

  async function resetStreak(uid: string): Promise<boolean> {
    try {
      await resetUserStreak(uid)
      if (selectedUser.value?.uid === uid) {
        selectedUser.value.currentStreak = 0
      }
      return true
    } catch {
      return false
    }
  }

  async function deleteUser(uid: string): Promise<DeleteUserOutcome> {
    try {
      const { results } = await adminDeleteUser(uid)
      const failedSteps = Object.entries(results)
        .filter(([, value]) => value !== 'ok')
        .map(([step]) => step)
      users.value = users.value.filter((u) => u.uid !== uid)
      if (selectedUser.value?.uid === uid) {
        selectedUser.value = null
      }
      return { ok: failedSteps.length === 0, failedSteps }
    } catch (error) {
      console.error('deleteUser failed', error)
      return { ok: false, failedSteps: [] }
    }
  }

  return {
    users,
    loading,
    error,
    selectedUser,
    selectedUserWorkouts,
    detailLoading,
    detailError,
    fetchUsers,
    fetchUserDetail,
    adjustXpCoins,
    resetStreak,
    deleteUser,
  }
})
