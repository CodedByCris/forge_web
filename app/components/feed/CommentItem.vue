<template>
  <div class="flex gap-3">
    <div class="w-8 h-8 rounded-full bg-forge-surfaceAlt border border-forge-divider flex items-center justify-center flex-shrink-0">
      <span class="text-forge-muted text-xs font-bold uppercase">{{ comment.userNickname.charAt(0) }}</span>
    </div>
    <div class="flex-1 min-w-0">
      <div class="bg-forge-surfaceAlt rounded-xl px-3 py-2">
        <p class="text-forge-text font-semibold text-xs mb-1">{{ comment.userNickname }}</p>
        <p class="text-forge-textSec text-sm leading-relaxed break-words">{{ comment.text }}</p>
      </div>
      <p class="text-forge-muted text-xs mt-1 ml-1">{{ timeAgo(comment.createdAt) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FeedComment } from '~/types/feed'
import { timeAgo } from '~/utils/time'

defineProps<{ comment: FeedComment }>()
</script>
