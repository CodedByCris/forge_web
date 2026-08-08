<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'
import type { CmsModeratedPost } from '~/types/cms/moderation'

defineProps<{
  post: CmsModeratedPost
}>()

const emit = defineEmits<{
  delete: []
}>()
</script>

<template>
  <div class="flex items-center justify-between gap-4 border-b border-forge-divider px-4 py-3 text-sm last:border-b-0">
    <img
      v-if="post.userPhotoUrl"
      :src="post.userPhotoUrl"
      :alt="post.userNickname"
      class="h-8 w-8 shrink-0 rounded-full object-cover"
    >
    <div
      v-else
      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forge-surfaceAlt text-xs font-semibold text-forge-textSec"
    >
      {{ post.userNickname.slice(0, 2).toUpperCase() }}
    </div>

    <div class="min-w-0 flex-1">
      <p class="truncate font-medium text-forge-text">{{ post.userNickname }}</p>
      <p class="truncate text-xs text-forge-muted">{{ post.workoutName }}</p>
    </div>

    <span class="shrink-0 text-xs text-forge-muted">{{ post.likesCount }} likes · {{ post.commentsCount }} comentarios</span>
    <span class="shrink-0 text-xs text-forge-muted">
      {{ post.createdAt ? post.createdAt.toLocaleDateString('es-ES') : '—' }}
    </span>

    <button
      type="button"
      class="shrink-0 rounded p-2 text-forge-textSec hover:bg-forge-danger/10 hover:text-forge-danger"
      aria-label="Eliminar"
      @click="emit('delete')"
    >
      <Trash2 class="h-4 w-4" />
    </button>
  </div>
</template>
