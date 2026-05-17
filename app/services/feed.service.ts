import {
  getFirestore,
  getDoc,
  getDocs,
  doc,
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  increment,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  type QueryConstraint,
} from 'firebase/firestore'
import type { FeedPost, FeedComment } from '~/types/feed'

function postFromDoc(d: QueryDocumentSnapshot | DocumentSnapshot): FeedPost {
  const data = d.data()!
  return {
    id: d.id,
    userId: data.userId,
    userNickname: data.userNickname,
    userPhotoUrl: data.userPhotoUrl ?? null,
    workoutId: data.workoutId,
    workoutName: data.workoutName,
    durationSeconds: data.durationSeconds ?? 0,
    totalVolumeKg: data.totalVolumeKg ?? 0,
    prsCount: data.prsCount ?? 0,
    exercisesPreview: data.exercisesPreview ?? [],
    likesCount: data.likesCount ?? 0,
    commentsCount: data.commentsCount ?? 0,
    reactionsMap: data.reactionsMap ?? {},
    createdAt: data.createdAt?.toDate() ?? new Date(),
  }
}


export const feedService = {
  /** IDs of users that userId follows */
  async fetchFollowingIds(userId: string): Promise<string[]> {
    const db = getFirestore()
    const snap = await getDocs(collection(db, 'users', userId, 'following'))
    return snap.docs.map((d) => d.id)
  },

  /** Paginated feed: posts from userId + following */
  async fetchFeedPosts(
    viewerIds: string[],
    lastDoc?: QueryDocumentSnapshot,
    pageSize = 15,
  ): Promise<{ posts: FeedPost[]; lastDoc: QueryDocumentSnapshot | null }> {
    const db = getFirestore()
    const ids = viewerIds.slice(0, 30) // Firestore 'in' cap

    const constraints: QueryConstraint[] = [
      where('userId', 'in', ids),
      orderBy('createdAt', 'desc'),
      limit(pageSize),
    ]
    if (lastDoc) constraints.push(startAfter(lastDoc))

    const snap = await getDocs(query(collection(db, 'posts'), ...constraints))
    const posts = snap.docs.map((d) => postFromDoc(d))
    const newLastDoc = (snap.docs[snap.docs.length - 1] as QueryDocumentSnapshot | undefined) ?? null
    return { posts, lastDoc: newLastDoc }
  },

  /** Returns a set of postIds that the user has liked (from given postIds) */
  async fetchLikedIds(userId: string, postIds: string[]): Promise<Set<string>> {
    const db = getFirestore()
    const likedIds = new Set<string>()
    await Promise.all(
      postIds.map(async (postId) => {
        const ref = doc(db, 'posts', postId, 'likes', userId)
        const snap = await getDoc(ref)
        if (snap.exists()) likedIds.add(postId)
      }),
    )
    return likedIds
  },

  /** Returns map of postId → emoji for posts user has reacted to */
  async fetchUserReactions(userId: string, postIds: string[]): Promise<Record<string, string>> {
    const db = getFirestore()
    const result: Record<string, string> = {}
    await Promise.all(
      postIds.map(async (postId) => {
        const ref = doc(db, 'posts', postId, 'reactions', userId)
        const snap = await getDoc(ref)
        if (snap.exists()) result[postId] = snap.data().emoji
      }),
    )
    return result
  },

  async toggleLike(postId: string, userId: string, currentlyLiked: boolean): Promise<void> {
    const db = getFirestore()
    const likeRef = doc(db, 'posts', postId, 'likes', userId)
    const postRef = doc(db, 'posts', postId)
    await runTransaction(db, async (tx) => {
      if (currentlyLiked) {
        tx.delete(likeRef)
        tx.update(postRef, { likesCount: increment(-1) })
      } else {
        tx.set(likeRef, { userId, createdAt: serverTimestamp() })
        tx.update(postRef, { likesCount: increment(1) })
      }
    })
  },

  async toggleReaction(
    postId: string,
    userId: string,
    emoji: string,
    prevEmoji: string | null,
  ): Promise<void> {
    const db = getFirestore()
    const reactionRef = doc(db, 'posts', postId, 'reactions', userId)
    const postRef = doc(db, 'posts', postId)
    await runTransaction(db, async (tx) => {
      const updates: Record<string, unknown> = {}
      if (prevEmoji) {
        updates[`reactionsMap.${prevEmoji}`] = increment(-1)
      }
      if (prevEmoji === emoji) {
        // toggling same emoji off
        tx.delete(reactionRef)
      } else {
        updates[`reactionsMap.${emoji}`] = increment(1)
        tx.set(reactionRef, { emoji, userId })
      }
      if (Object.keys(updates).length) tx.update(postRef, updates)
    })
  },

  watchComments(
    postId: string,
    callback: (comments: FeedComment[]) => void,
  ): () => void {
    const db = getFirestore()
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc'),
    )
    return onSnapshot(q, (snap) => {
      const comments: FeedComment[] = snap.docs.map((d) => ({
        id: d.id,
        userId: d.data().userId,
        userNickname: d.data().userNickname,
        text: d.data().text,
        createdAt: d.data().createdAt?.toDate() ?? new Date(),
      }))
      callback(comments)
    })
  },

  async addComment(
    postId: string,
    userId: string,
    userNickname: string,
    text: string,
  ): Promise<void> {
    const db = getFirestore()
    const postRef = doc(db, 'posts', postId)
    await runTransaction(db, async (tx) => {
      const commentRef = doc(collection(db, 'posts', postId, 'comments'))
      tx.set(commentRef, { userId, userNickname, text, createdAt: serverTimestamp() })
      tx.update(postRef, { commentsCount: increment(1) })
    })
  },

  async deletePost(postId: string): Promise<void> {
    const db = getFirestore()
    await deleteDoc(doc(db, 'posts', postId))
  },

  async createWorkoutPost(params: {
    userId: string
    userNickname: string
    userPhotoUrl: string | null
    workoutId: string
    workoutName: string
    durationSeconds: number
    totalVolumeKg: number
    prsCount: number
    exercisesPreview: Array<{ name: string; nameEs: string | null; sets: number; reps: string }>
  }): Promise<void> {
    const db = getFirestore()
    await addDoc(collection(db, 'posts'), {
      ...params,
      likesCount: 0,
      commentsCount: 0,
      reactionsMap: {},
      createdAt: serverTimestamp(),
    })
  },
}
