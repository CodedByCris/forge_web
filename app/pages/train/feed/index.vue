<template>
  <div class="animate-fade-in">
    <h1 class="text-xl font-bold mb-5">Actividad</h1>

    <!-- Skeleton -->
    <div v-if="feedStore.loading" class="space-y-4">
      <FeedSkeletonCard v-for="i in 4" :key="i" />
    </div>

    <!-- Empty -->
    <FeedEmptyState v-else-if="!feedStore.posts.length" />

    <!-- Feed -->
    <div v-else class="space-y-4">
      <FeedPostCard
        v-for="post in feedStore.posts"
        :key="post.id"
        :post="post"
        :is-liked="feedStore.likedIds.has(post.id)"
        :user-reaction="feedStore.userReactions[post.id] ?? null"
        :current-user-id="user!.uid"
        @like="feedStore.toggleLike(post.id, user!.uid)"
        @react="(emoji) => feedStore.toggleReaction(post.id, user!.uid, emoji)"
        @delete="handleDelete(post.id)"
        @commented="feedStore.incrementCommentsCount(post.id)"
      />

      <!-- Load more trigger -->
      <div ref="loadMoreRef" class="h-12 flex items-center justify-center">
        <div v-if="feedStore.loadingMore" class="flex gap-1">
          <div v-for="i in 3" :key="i" class="w-1.5 h-1.5 bg-forge-muted rounded-full animate-bounce" :style="{ animationDelay: `${i * 0.1}s` }" />
        </div>
        <p v-else-if="!feedStore.hasMore && feedStore.posts.length > 5" class="text-forge-muted text-xs">
          Ya viste todo
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { storeToRefs } from 'pinia'
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: 'train', middleware: 'auth' })

const { user } = storeToRefs(useAuthStore())
const feedStore = useFeedStore()
const { show } = useToast()

const loadMoreRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(async () => {
  if (user.value) {
    await feedStore.loadFeed(user.value.uid)
  }

  // Infinite scroll
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && feedStore.hasMore && user.value) {
        feedStore.loadMore(user.value.uid)
      }
    },
    { threshold: 0.1 },
  )
  if (loadMoreRef.value) observer.observe(loadMoreRef.value)
})

onUnmounted(() => {
  observer?.disconnect()
})

async function handleDelete(postId: string) {
  try {
    await feedStore.deletePost(postId)
    show('Post eliminado', 'success')
  } catch {
    show('No se pudo eliminar', 'error')
  }
}
</script>
