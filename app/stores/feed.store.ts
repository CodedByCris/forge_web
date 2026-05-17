import { defineStore } from 'pinia'
import { feedService } from '~/services/feed.service'
import type { FeedPost } from '~/types/feed'
import type { QueryDocumentSnapshot } from 'firebase/firestore'

export const useFeedStore = defineStore('feed', () => {
  const posts = ref<FeedPost[]>([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const hasMore = ref(true)
  const likedIds = ref<Set<string>>(new Set())
  const userReactions = ref<Record<string, string>>({}) // postId → emoji
  let lastDoc: QueryDocumentSnapshot | null = null

  async function loadFeed(userId: string): Promise<void> {
    loading.value = true
    lastDoc = null
    hasMore.value = true
    try {
      const followingIds = await feedService.fetchFollowingIds(userId)
      const viewerIds = [...new Set([userId, ...followingIds])]
      const result = await feedService.fetchFeedPosts(viewerIds)
      posts.value = result.posts
      lastDoc = result.lastDoc
      hasMore.value = result.posts.length === 15

      if (result.posts.length) {
        const ids = result.posts.map((p) => p.id)
        const [liked, reactions] = await Promise.all([
          feedService.fetchLikedIds(userId, ids),
          feedService.fetchUserReactions(userId, ids),
        ])
        likedIds.value = liked
        userReactions.value = reactions
      }
    } finally {
      loading.value = false
    }
  }

  async function loadMore(userId: string): Promise<void> {
    if (loadingMore.value || !hasMore.value || !lastDoc) return
    loadingMore.value = true
    try {
      const followingIds = await feedService.fetchFollowingIds(userId)
      const viewerIds = [...new Set([userId, ...followingIds])]
      const result = await feedService.fetchFeedPosts(viewerIds, lastDoc)
      posts.value.push(...result.posts)
      lastDoc = result.lastDoc
      hasMore.value = result.posts.length === 15

      if (result.posts.length) {
        const ids = result.posts.map((p) => p.id)
        const [liked, reactions] = await Promise.all([
          feedService.fetchLikedIds(userId, ids),
          feedService.fetchUserReactions(userId, ids),
        ])
        ids.forEach((id) => { if (liked.has(id)) likedIds.value.add(id) })
        Object.assign(userReactions.value, reactions)
      }
    } finally {
      loadingMore.value = false
    }
  }

  async function toggleLike(postId: string, userId: string): Promise<void> {
    const isLiked = likedIds.value.has(postId)
    // Optimistic update
    const post = posts.value.find((p) => p.id === postId)
    if (post) {
      if (isLiked) {
        likedIds.value.delete(postId)
        post.likesCount = Math.max(0, post.likesCount - 1)
      } else {
        likedIds.value.add(postId)
        post.likesCount += 1
      }
    }
    try {
      await feedService.toggleLike(postId, userId, isLiked)
    } catch {
      // Rollback
      const p = posts.value.find((x) => x.id === postId)
      if (p) {
        if (isLiked) {
          likedIds.value.add(postId)
          p.likesCount += 1
        } else {
          likedIds.value.delete(postId)
          p.likesCount = Math.max(0, p.likesCount - 1)
        }
      }
    }
  }

  async function toggleReaction(postId: string, userId: string, emoji: string): Promise<void> {
    const prevEmoji = userReactions.value[postId] ?? null
    const post = posts.value.find((p) => p.id === postId)
    if (!post) return

    // Optimistic update
    if (prevEmoji) {
      post.reactionsMap[prevEmoji] = Math.max(0, (post.reactionsMap[prevEmoji] ?? 1) - 1)
      if (post.reactionsMap[prevEmoji] === 0) delete post.reactionsMap[prevEmoji]
    }
    if (prevEmoji === emoji) {
      delete userReactions.value[postId]
    } else {
      post.reactionsMap[emoji] = (post.reactionsMap[emoji] ?? 0) + 1
      userReactions.value[postId] = emoji
    }

    try {
      await feedService.toggleReaction(postId, userId, emoji, prevEmoji)
    } catch {
      // Rollback: reload will fix — skip complex rollback
    }
  }

  async function deletePost(postId: string): Promise<void> {
    await feedService.deletePost(postId)
    posts.value = posts.value.filter((p) => p.id !== postId)
  }

  function incrementCommentsCount(postId: string): void {
    const post = posts.value.find((p) => p.id === postId)
    if (post) post.commentsCount += 1
  }

  function reset(): void {
    posts.value = []
    loading.value = false
    loadingMore.value = false
    hasMore.value = true
    likedIds.value = new Set()
    userReactions.value = {}
    lastDoc = null
  }

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    likedIds,
    userReactions,
    loadFeed,
    loadMore,
    toggleLike,
    toggleReaction,
    deletePost,
    incrementCommentsCount,
    reset,
  }
})
