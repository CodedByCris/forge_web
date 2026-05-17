# Feature: Feed Social

## Qué hace

Feed de posts de entrenamientos completados. El usuario ve sus propios posts y los de usuarios que sigue. Puede dar like, reaccionar con emoji y comentar.

---

## Ruta

```
/train/feed               ← feed principal
/train/feed/[postId]      ← detalle post + comentarios (opcional, puede ser modal)
```

---

## Archivos

```
services/feed.service.ts
stores/feed.store.ts
pages/train/feed/index.vue
pages/train/feed/[postId].vue  (o modal)
components/feed/
  PostCard.vue
  PostHeader.vue
  ExercisesPreview.vue
  LikeButton.vue
  ReactionBar.vue
  ReactionPicker.vue
  CommentList.vue
  CommentInput.vue
  PostStatsBadge.vue
```

---

## Servicio Firestore

```typescript
// services/feed.service.ts
import {
  collection, collectionGroup, doc, query, where, orderBy,
  limit, getDocs, onSnapshot, runTransaction, addDoc,
  writeBatch, serverTimestamp, increment, getDoc
} from 'firebase/firestore'
import { db } from '~/plugins/firebase.client'

export const feedService = {

  // Obtiene lista de UIDs que sigo (status accepted)
  async fetchFollowingIds(currentUserId: string): Promise<string[]> {
    const snap = await getDocs(query(
      collection(db, 'follows'),
      where('followerId', '==', currentUserId),
      where('status', '==', 'accepted')
    ))
    return snap.docs.map(d => d.data().followingId as string)
  },

  // Fetch feed: mis posts + posts de seguidos
  // Firestore no soporta OR queries en múltiples docs, así que:
  // 1. Fetch mis posts
  // 2. Si followingIds no vacío: fetch sus posts
  // 3. Merge + ordenar por createdAt desc en cliente
  async fetchFeedPosts(params: {
    currentUserId: string
    followingIds: string[]
    pageSize?: number
  }): Promise<FeedPost[]> {
    const size = params.pageSize ?? 20
    const userIds = [params.currentUserId, ...params.followingIds].slice(0, 10)
    // Firestore whereIn max 10 valores

    if (userIds.length === 0) return []

    const snap = await getDocs(query(
      collection(db, 'posts'),
      where('userId', 'in', userIds),
      orderBy('createdAt', 'desc'),
      limit(size)
    ))

    // Enriquecer con datos del usuario actual (like + reaction)
    const posts = await Promise.all(snap.docs.map(async (d) => {
      const [likeSnap, reactionSnap] = await Promise.all([
        getDoc(doc(db, 'posts', d.id, 'likes', params.currentUserId)),
        getDoc(doc(db, 'posts', d.id, 'reactions', params.currentUserId)),
      ])

      return mapPost(d, {
        likedByMe: likeSnap.exists(),
        myReaction: reactionSnap.exists()
          ? (reactionSnap.data()?.emoji as string)
          : null,
      })
    }))

    return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  },

  // Crear post al finalizar un workout
  async createPost(params: {
    userId: string
    userNickname: string
    userPhotoUrl: string | null
    workoutId: string
    workoutName: string
    durationSeconds: number
    totalVolumeKg: number
    prsCount: number
    exercisesPreview: ExercisePreview[]   // max 5
  }): Promise<void> {
    await addDoc(collection(db, 'posts'), {
      ...params,
      likesCount: 0,
      commentsCount: 0,
      reactionsMap: {},
      createdAt: serverTimestamp(),
    })
  },

  // Toggle like (transaction)
  async toggleLike(params: {
    postId: string
    userId: string
    currentlyLiked: boolean
  }): Promise<void> {
    const postRef = doc(db, 'posts', params.postId)
    const likeRef = doc(db, 'posts', params.postId, 'likes', params.userId)

    await runTransaction(db, async (tx) => {
      if (params.currentlyLiked) {
        tx.delete(likeRef)
        tx.update(postRef, { likesCount: increment(-1) })
      } else {
        tx.set(likeRef, { userId: params.userId, createdAt: serverTimestamp() })
        tx.update(postRef, { likesCount: increment(1) })
      }
    })
  },

  // Toggle reaction emoji
  // Lógica: mismo emoji → quitar | diferente → swap | ninguna → añadir
  async toggleReaction(params: {
    postId: string
    userId: string
    emoji: string
    currentReaction: string | null
  }): Promise<void> {
    const postRef = doc(db, 'posts', params.postId)
    const reactionRef = doc(db, 'posts', params.postId, 'reactions', params.userId)

    await runTransaction(db, async (tx) => {
      const isSame = params.currentReaction === params.emoji

      if (params.currentReaction) {
        // Quitar reacción anterior
        tx.update(postRef, {
          [`reactionsMap.${params.currentReaction}`]: increment(-1)
        })
      }

      if (!isSame) {
        // Añadir nueva reacción
        tx.set(reactionRef, { userId: params.userId, emoji: params.emoji, createdAt: serverTimestamp() })
        tx.update(postRef, {
          [`reactionsMap.${params.emoji}`]: increment(1)
        })
      } else {
        // Era la misma → solo quitar
        tx.delete(reactionRef)
      }
    })
  },

  // Comentarios en tiempo real
  watchComments(postId: string, cb: (comments: FeedComment[]) => void): () => void {
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc')
    )
    return onSnapshot(q, (snap) => {
      cb(snap.docs.map(d => mapComment(d)))
    })
  },

  // Añadir comentario + incrementar contador
  async addComment(params: {
    postId: string
    userId: string
    userNickname: string
    userPhotoUrl: string | null
    text: string
  }): Promise<void> {
    const batch = writeBatch(db)
    const commentRef = doc(collection(db, 'posts', params.postId, 'comments'))

    batch.set(commentRef, {
      userId: params.userId,
      userNickname: params.userNickname,
      userPhotoUrl: params.userPhotoUrl,
      text: params.text.trim(),
      createdAt: serverTimestamp(),
    })
    batch.update(doc(db, 'posts', params.postId), {
      commentsCount: increment(1)
    })

    await batch.commit()
  },

  async deletePost(postId: string): Promise<void> {
    await (await import('firebase/firestore')).deleteDoc(
      doc(db, 'posts', postId)
    )
  },
}

function mapPost(d: any, extra: { likedByMe: boolean, myReaction: string | null }): FeedPost {
  const data = d.data()
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
    likedByMe: extra.likedByMe,
    myReaction: extra.myReaction,
  }
}

function mapComment(d: any): FeedComment {
  const data = d.data()
  return {
    id: d.id,
    userId: data.userId,
    userNickname: data.userNickname,
    userPhotoUrl: data.userPhotoUrl ?? null,
    text: data.text,
    createdAt: data.createdAt?.toDate() ?? new Date(),
  }
}
```

---

## Store

```typescript
// stores/feed.store.ts
export const useFeedStore = defineStore('feed', () => {
  const posts = ref<FeedPost[]>([])
  const loading = ref(false)
  const followingIds = ref<string[]>([])

  async function loadFeed(currentUserId: string) {
    loading.value = true
    try {
      followingIds.value = await feedService.fetchFollowingIds(currentUserId)
      posts.value = await feedService.fetchFeedPosts({
        currentUserId,
        followingIds: followingIds.value,
      })
    } finally {
      loading.value = false
    }
  }

  function updatePostOptimistically(postId: string, patch: Partial<FeedPost>) {
    const idx = posts.value.findIndex(p => p.id === postId)
    if (idx !== -1) {
      posts.value[idx] = { ...posts.value[idx], ...patch }
    }
  }

  async function toggleLike(postId: string, userId: string) {
    const post = posts.value.find(p => p.id === postId)
    if (!post) return

    // Optimistic update
    updatePostOptimistically(postId, {
      likedByMe: !post.likedByMe,
      likesCount: post.likedByMe ? post.likesCount - 1 : post.likesCount + 1,
    })

    try {
      await feedService.toggleLike({ postId, userId, currentlyLiked: post.likedByMe })
    } catch {
      // Revert on error
      updatePostOptimistically(postId, {
        likedByMe: post.likedByMe,
        likesCount: post.likesCount,
      })
    }
  }

  async function toggleReaction(postId: string, userId: string, emoji: string) {
    const post = posts.value.find(p => p.id === postId)
    if (!post) return

    const currentReaction = post.myReaction
    const isSame = currentReaction === emoji

    // Optimistic update del reactionsMap
    const newMap = { ...post.reactionsMap }
    if (currentReaction) newMap[currentReaction] = Math.max(0, (newMap[currentReaction] ?? 1) - 1)
    if (!isSame) newMap[emoji] = (newMap[emoji] ?? 0) + 1

    updatePostOptimistically(postId, {
      myReaction: isSame ? null : emoji,
      reactionsMap: newMap,
    })

    await feedService.toggleReaction({ postId, userId, emoji, currentReaction })
  }

  async function deletePost(postId: string) {
    await feedService.deletePost(postId)
    posts.value = posts.value.filter(p => p.id !== postId)
  }

  return {
    posts, loading, followingIds,
    loadFeed, toggleLike, toggleReaction, deletePost, updatePostOptimistically,
  }
})
```

---

## UI — Feed Page (`/train/feed`)

### Layout

```
AppBar: "Feed"  [🔄 Actualizar]

─────────────────────────────

PostCard: "Carlos M."
┌────────────────────────────────┐
│ 🧑 Carlos M.      hace 2h  [⋯]│
│                                │
│ Push Day  ·  45min  ·  2340kg  │
│ 🏆 1 PR nuevo                  │
│                                │
│ • Press Banca   3×10           │
│ • Vuelos        4×12           │
│ • Fondos        3×max          │
│                                │
│ ─────────────────────────────  │
│ [❤️ 12]  [🔥💪]  [💬 3]      │
└────────────────────────────────┘

PostCard: ...
```

### PostCard

- Header: avatar + nickname + tiempo relativo + menú `⋯` (si es mi post: eliminar)
- Resumen: nombre workout + duración + volumen total
- Badge PRs si `prsCount > 0`
- Lista ejercicios preview (max 3, con "y N más" si hay más)
- Barra de acciones: like + reactions total + comentarios count

### LikeButton

- Corazón relleno/vacío según `likedByMe`
- Animación de escala en tap
- Optimistic update (no espera Firestore)

### ReactionBar

- Muestra emojis con contador si `total > 0`
- Tap → abre ReactionPicker
- ReactionPicker: `['🔥', '💪', '😤', '🧠']` en fila
- Mi reacción resaltada
- Tap misma → quita; tap diferente → cambia

### Comentarios (en detalle o bottom sheet)

```
─────────────────────────────
Comentarios (3)

  🧑 Carlos: "Beast mode! 💪"
  🧑 Ana: "Qué bárbaro"

─────────────────────────────
┌────────────────────────────┐
│  Escribe un comentario...  │  [Enviar]
└────────────────────────────┘
```

- Lista ordenada por `createdAt` asc
- Input al fondo, pegado al teclado
- Enviar en Enter o botón
- Deshabilitar botón si texto vacío

### Tiempo relativo

```typescript
// utils/time.ts
export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'ahora'
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)}h`
  return `hace ${Math.floor(seconds / 86400)}d`
}
```

### Estado vacío

```
┌──────────────────────────────┐
│          🏋️                  │
│   Tu feed está vacío         │
│   Completa un entrenamiento  │
│   o sigue a tus amigos       │
└──────────────────────────────┘
```

---

## Reglas de negocio

- Feed = mis posts + posts de usuarios con `follows.status == 'accepted'`
- Firestore `whereIn` máx 10 valores → si sigues >9 personas, paginar en grupos de 10 y mergear
- Solo el autor puede eliminar su post
- Un usuario = máximo 1 reacción por post (se reemplaza, no acumula)
- Emojis soportados: `['🔥', '💪', '😤', '🧠']` — no libres
- `reactionsMap` puede tener contadores a 0 (no limpiarlos del mapa en cliente, solo al leer)

---

## Limitaciones conocidas (MVP web)

- No hay paginación infinita — solo primera página (20 posts)
- No hay notificaciones en tiempo real de nuevos posts — botón "Actualizar"
- Si sigue >9 usuarios, puede no ver todos los posts (limitación whereIn)
- No hay búsqueda de usuarios para seguir (solo feed)

---

## Decisiones técnicas

- Optimistic updates para like y reactions → UI fluida sin esperar Firestore
- Comentarios en tiempo real (`onSnapshot`) solo cuando el detalle está abierto
- `fetchFollowingIds` separado del fetch de posts (se puede cachear por sesión)
- No se usa `collectionGroup` para evitar índices adicionales
- El post se crea automáticamente al terminar workout (ver WORKOUT.md)
