<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex flex-col justify-end" @click.self="emit('close')">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')" />

      <!-- Sheet -->
      <div class="relative bg-forge-surface rounded-t-3xl border-t border-forge-divider flex flex-col max-h-[85dvh] animate-fade-in-up">
        <!-- Drag handle -->
        <div class="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div class="w-10 h-1 rounded-full bg-forge-divider" />
        </div>

        <!-- Header -->
        <div class="flex items-center justify-between px-5 pb-3 border-b border-forge-divider flex-shrink-0">
          <h3 class="font-semibold text-forge-text">Comentarios</h3>
          <button @click="emit('close')" class="text-forge-muted hover:text-forge-text transition-colors p-1">
            <X :size="20" />
          </button>
        </div>

        <!-- Comments list -->
        <div ref="listRef" class="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
          <div v-if="loading" class="space-y-4">
            <div v-for="i in 3" :key="i" class="flex gap-3 animate-pulse">
              <div class="w-8 h-8 rounded-full bg-forge-surfaceAlt" />
              <div class="flex-1 space-y-2">
                <div class="h-3 bg-forge-surfaceAlt rounded w-24" />
                <div class="h-3 bg-forge-surfaceAlt rounded w-40" />
              </div>
            </div>
          </div>
          <div v-else-if="!comments.length" class="text-center py-8">
            <p class="text-forge-muted text-sm">Sin comentarios aún. ¡Sé el primero!</p>
          </div>
          <FeedCommentItem v-for="c in comments" :key="c.id" :comment="c" />
        </div>

        <!-- Input -->
        <div class="px-4 py-3 border-t border-forge-divider flex gap-2 flex-shrink-0 bg-forge-surface" style="padding-bottom: max(12px, env(safe-area-inset-bottom))">
          <input
            v-model="text"
            @keyup.enter="submit"
            placeholder="Añade un comentario..."
            maxlength="300"
            class="flex-1 bg-forge-surfaceAlt border border-forge-divider rounded-xl px-4 py-2.5 text-sm text-forge-text placeholder-forge-muted focus:outline-none focus:border-forge-primary/60 transition-colors"
          />
          <button
            @click="submit"
            :disabled="!text.trim() || sending"
            class="w-10 h-10 rounded-xl gradient-orange text-white flex items-center justify-center disabled:opacity-40 transition-opacity flex-shrink-0"
          >
            <Send :size="16" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X, Send } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { feedService } from '~/services/feed.service'
import type { FeedComment } from '~/types/feed'

const props = defineProps<{ postId: string }>()
const emit = defineEmits<{ close: []; commented: [] }>()

const comments = ref<FeedComment[]>([])
const loading = ref(true)
const text = ref('')
const sending = ref(false)
const listRef = ref<HTMLElement | null>(null)

const { user, profile } = storeToRefs(useAuthStore())
let unsub: (() => void) | null = null

onMounted(() => {
  unsub = feedService.watchComments(props.postId, (data) => {
    comments.value = data
    loading.value = false
    nextTick(() => {
      if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight
    })
  })
})

onUnmounted(() => {
  unsub?.()
})

async function submit() {
  if (!text.value.trim() || sending.value || !user.value) return
  sending.value = true
  const msg = text.value.trim()
  text.value = ''
  try {
    await feedService.addComment(
      props.postId,
      user.value.uid,
      profile.value?.nickname ?? user.value.email ?? 'Usuario',
      msg,
    )
    emit('commented')
  } finally {
    sending.value = false
  }
}
</script>
