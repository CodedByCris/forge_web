<template>
  <div class="flex items-center justify-between pt-1">
    <!-- Left: reactions + like -->
    <div class="flex items-center gap-2">
      <!-- Like button -->
      <button
        @click="emit('like')"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-sm font-medium"
        :class="isLiked
          ? 'text-forge-primary bg-forge-primary/10'
          : 'text-forge-muted hover:text-forge-text hover:bg-forge-surfaceAlt'"
      >
        <Heart :size="16" :fill="isLiked ? 'currentColor' : 'none'" />
        <span>{{ likesCount > 0 ? likesCount : '' }}</span>
      </button>

      <!-- Reaction picker toggle -->
      <div class="relative" ref="reactionRef">
        <button
          @click="pickerOpen = !pickerOpen"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-sm font-medium"
          :class="userReaction
            ? 'text-forge-accent bg-forge-accent/10'
            : 'text-forge-muted hover:text-forge-text hover:bg-forge-surfaceAlt'"
        >
          <span v-if="userReaction" class="text-base leading-none">{{ userReaction }}</span>
          <Smile v-else :size="16" />
        </button>

        <!-- Emoji picker -->
        <div
          v-if="pickerOpen"
          class="absolute bottom-10 left-0 bg-forge-surface border border-forge-divider rounded-2xl p-2 flex gap-1 shadow-lg z-20 animate-scale-in"
        >
          <button
            v-for="emoji in EMOJIS"
            :key="emoji"
            @click="emit('react', emoji); pickerOpen = false"
            class="text-xl p-1.5 rounded-xl hover:bg-forge-surfaceAlt transition-colors"
            :class="userReaction === emoji ? 'bg-forge-surfaceAlt' : ''"
          >
            {{ emoji }}
          </button>
        </div>
      </div>

      <!-- Active reactions summary -->
      <div v-if="totalReactions > 0" class="flex items-center gap-1">
        <span
          v-for="[emoji, count] in topReactions"
          :key="emoji"
          class="text-sm text-forge-muted"
        >{{ emoji }}{{ count > 1 ? count : '' }}</span>
      </div>
    </div>

    <!-- Right: comment button -->
    <button
      @click="emit('comment')"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-forge-muted hover:text-forge-text hover:bg-forge-surfaceAlt transition-all"
    >
      <MessageCircle :size="16" />
      <span>{{ commentsCount > 0 ? commentsCount : '' }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Heart, Smile, MessageCircle } from 'lucide-vue-next'

const EMOJIS = ['💪', '🔥', '⚡', '🏆', '👏', '😤']

const props = defineProps<{
  likesCount: number
  commentsCount: number
  reactionsMap: Record<string, number>
  isLiked: boolean
  userReaction: string | null
}>()

const emit = defineEmits<{
  like: []
  react: [emoji: string]
  comment: []
}>()

const pickerOpen = ref(false)
const reactionRef = ref<HTMLElement | null>(null)

const totalReactions = computed(() => Object.values(props.reactionsMap).reduce((a, b) => a + b, 0))
const topReactions = computed(() =>
  Object.entries(props.reactionsMap)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3),
)

onMounted(() => document.addEventListener('click', handleOutside))
onUnmounted(() => document.removeEventListener('click', handleOutside))

function handleOutside(e: MouseEvent) {
  if (reactionRef.value && !reactionRef.value.contains(e.target as Node)) {
    pickerOpen.value = false
  }
}
</script>
