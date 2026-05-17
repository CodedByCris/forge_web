<template>
  <article class="bg-forge-surface border border-forge-divider rounded-2xl p-4 space-y-3 animate-fade-in">
    <!-- Header -->
    <FeedPostHeader
      :nickname="post.userNickname"
      :photo-url="post.userPhotoUrl"
      :created-at="post.createdAt"
      :is-own="isOwn"
      @delete="handleDelete"
    />

    <!-- Workout name -->
    <div>
      <h3 class="text-forge-text font-bold text-base leading-tight">{{ post.workoutName }}</h3>
    </div>

    <!-- Stats -->
    <FeedWorkoutStats
      :duration-seconds="post.durationSeconds"
      :total-volume-kg="post.totalVolumeKg"
      :prs-count="post.prsCount"
    />

    <!-- Exercise preview -->
    <FeedExercisePreview v-if="post.exercisesPreview.length" :exercises="post.exercisesPreview" />

    <!-- Divider -->
    <div class="border-t border-forge-divider" />

    <!-- Reaction bar -->
    <FeedReactionBar
      :likes-count="post.likesCount"
      :comments-count="post.commentsCount"
      :reactions-map="post.reactionsMap"
      :is-liked="isLiked"
      :user-reaction="userReaction"
      @like="emit('like')"
      @react="(emoji) => emit('react', emoji)"
      @comment="commentOpen = true"
    />

    <!-- Comment sheet -->
    <FeedCommentSheet
      v-if="commentOpen"
      :post-id="post.id"
      @close="commentOpen = false"
      @commented="emit('commented')"
    />
  </article>
</template>

<script setup lang="ts">
import type { FeedPost } from '~/types/feed'

const props = defineProps<{
  post: FeedPost
  isLiked: boolean
  userReaction: string | null
  currentUserId: string
}>()

const emit = defineEmits<{
  like: []
  react: [emoji: string]
  delete: []
  commented: []
}>()

const commentOpen = ref(false)
const isOwn = computed(() => props.post.userId === props.currentUserId)

async function handleDelete() {
  emit('delete')
}
</script>
