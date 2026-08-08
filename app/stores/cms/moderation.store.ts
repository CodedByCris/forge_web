import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CmsModeratedPost, CmsModeratedRoutine } from '~/types/cms/moderation'
import {
  getRecentPosts,
  getRecentRoutines,
  deletePost,
  deleteRoutine,
} from '~/services/cms/moderation.service'

export const useCmsModerationStore = defineStore('cmsModeration', () => {
  const posts = ref<CmsModeratedPost[]>([])
  const postsLoading = ref(false)
  const postsError = ref<string | null>(null)

  const routines = ref<CmsModeratedRoutine[]>([])
  const routinesLoading = ref(false)
  const routinesError = ref<string | null>(null)

  async function fetchPosts(): Promise<void> {
    postsLoading.value = true
    postsError.value = null
    try {
      posts.value = await getRecentPosts()
    } catch {
      postsError.value = 'No se pudieron cargar los posts.'
    } finally {
      postsLoading.value = false
    }
  }

  async function fetchRoutines(): Promise<void> {
    routinesLoading.value = true
    routinesError.value = null
    try {
      routines.value = await getRecentRoutines()
    } catch {
      routinesError.value = 'No se pudieron cargar las rutinas.'
    } finally {
      routinesLoading.value = false
    }
  }

  async function removePost(id: string): Promise<boolean> {
    try {
      await deletePost(id)
      posts.value = posts.value.filter((p) => p.id !== id)
      return true
    } catch {
      return false
    }
  }

  async function removeRoutine(id: string): Promise<boolean> {
    try {
      await deleteRoutine(id)
      routines.value = routines.value.filter((r) => r.id !== id)
      return true
    } catch {
      return false
    }
  }

  return {
    posts,
    postsLoading,
    postsError,
    routines,
    routinesLoading,
    routinesError,
    fetchPosts,
    fetchRoutines,
    removePost,
    removeRoutine,
  }
})
