import { defineStore } from 'pinia'
import { ref } from 'vue'
import { FirebaseError } from 'firebase/app'
import type { CmsUser } from '~/types/cms/user'
import type { CmsNotificationPayload } from '~/types/cms/notification'
import { getUsers } from '~/services/cms/users.service'
import { sendToUser, sendToAll } from '~/services/cms/notifications.service'
import { useCmsAuthStore } from '~/stores/cms/auth.store'

function describeSendError(e: unknown): string {
  if (e instanceof FirebaseError && e.code === 'permission-denied') {
    return 'No se pudo enviar: Firestore rechazó la escritura (código permission-denied). Revisa que no estés intentando enviarte una notificación a ti mismo — las rules lo bloquean explícitamente.'
  }
  if (e instanceof FirebaseError) {
    return `No se pudo enviar la notificación (${e.code}).`
  }
  return 'No se pudo enviar la notificación.'
}

export const useCmsNotificationsStore = defineStore('cmsNotifications', () => {
  const users = ref<CmsUser[]>([])
  const usersLoading = ref(false)
  const usersError = ref<string | null>(null)

  const sending = ref(false)
  const sendError = ref<string | null>(null)
  const lastSentCount = ref<number | null>(null)

  async function fetchUsers(): Promise<void> {
    usersLoading.value = true
    usersError.value = null
    try {
      users.value = await getUsers()
    } catch {
      usersError.value = 'No se pudieron cargar los usuarios.'
    } finally {
      usersLoading.value = false
    }
  }

  async function sendToOne(toUid: string, payload: CmsNotificationPayload): Promise<boolean> {
    const authStore = useCmsAuthStore()
    if (!authStore.user) return false
    sending.value = true
    sendError.value = null
    lastSentCount.value = null

    if (toUid === authStore.user.uid) {
      sendError.value = 'No puedes enviarte una notificación a ti mismo — elige otro usuario.'
      sending.value = false
      return false
    }

    try {
      await sendToUser(authStore.user.uid, toUid, payload)
      lastSentCount.value = 1
      return true
    } catch (e) {
      sendError.value = describeSendError(e)
      return false
    } finally {
      sending.value = false
    }
  }

  async function sendToEveryone(payload: CmsNotificationPayload): Promise<boolean> {
    const authStore = useCmsAuthStore()
    if (!authStore.user) return false
    sending.value = true
    sendError.value = null
    lastSentCount.value = null
    try {
      if (users.value.length === 0) {
        await fetchUsers()
      }
      const count = await sendToAll(authStore.user.uid, users.value.map((u) => u.uid), payload)
      lastSentCount.value = count
      return true
    } catch (e) {
      sendError.value = describeSendError(e)
      return false
    } finally {
      sending.value = false
    }
  }

  return {
    users,
    usersLoading,
    usersError,
    sending,
    sendError,
    lastSentCount,
    fetchUsers,
    sendToOne,
    sendToEveryone,
  }
})
