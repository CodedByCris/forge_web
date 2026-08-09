# Backend / Firebase — Web

Proyecto Firebase: `gym-app-41fd6`
SDK: `firebase` v10+ (modular, web)

El esquema Firestore es **idéntico** al de la app móvil. La web NO crea colecciones nuevas. Solo usa las existentes.

---

## Colecciones relevantes para la portada y `/cms`

### `users/{userId}`

```typescript
{
  id: string                  // UID Firebase Auth
  email: string
  nickname: string
  photoUrl: string | null
  firstName: string | null
  lastName: string | null
  heightCm: number | null
  weightKg: number | null
  configured: boolean
  buildType: string | null    // 'powerlifter' | 'bodybuilder' | 'hybrid' | 'athlete'
  activeTitle: string | null
  isPrivate: boolean
  followersCount: number
  followingCount: number
  totalXp: number
  coins: number
  currentStreak: number       // NUEVO en la doc (2026-08-08) — ya existía en producción, documentado en forge/.claude/BACKEND.md pero no aquí. Días consecutivos con workout, actualizado por Cloud Function `dailyStreakReset`.
  lastXpDate: string | null   // 'YYYY-MM-DD'
  purchasedItems: string[]
  createdAt: Timestamp
  fcmToken: string | null     // ⚠️ en progreso en `forge` (2026-08-08) — token FCM del dispositivo móvil, para push. La web no lo usa ni lo escribe.
  isAdmin: boolean            // NUEVO (2026-08-08) — gate de acceso a /cms. Solo el CMS lo lee; nadie lo escribe desde código, se asigna a mano en Firestore/Firebase Auth. Ver docs/superpowers/specs/2026-08-08-cms-base-auth-design.md.
}
```

### `users/{userId}/badges/{badgeId}`

```typescript
{
  earnedAt: Timestamp
  seen: boolean
}
```

### `users/{userId}/prs/{exerciseKey}`

```typescript
{
  exerciseKey: string
  exerciseName: string
  exerciseNameEs: string | null
  bestByReps: {
    [reps: string]: {
      weight: number
      date: number        // ms timestamp
      workoutId: string | null
    }
  }
  estimatedOneRepMax: number
  lastUpdated: Timestamp
}
```

### `users/{userId}/workout_templates/{templateId}`

```typescript
{
  name: string
  color: number            // ARGB int
  exercises: Array<{
    name: string
    nameEs: string | null
    order: number
    defaultSets: number
    defaultReps: string
    exerciseId: string | null
    bodyParts: string[]
    exerciseType: string   // 'standard' | 'assistedBody' | 'timed' | 'cardioDistance'
  }>
  updatedAt: Timestamp
}
```

> Máximo 5 plantillas por usuario (validado en cliente).

### `users/{userId}/goals/{goalId}`

```typescript
{
  type: string             // 'strength' | 'hypertrophy' | 'consistency' | 'custom'
  title: string
  description: string | null
  targetValue: number
  startValue: number
  exerciseId: string | null
  exerciseName: string | null
  deadline: Timestamp | null
  createdAt: Timestamp
  completedAt: Timestamp | null
  customCurrentValue: number | null
}
```

---

### `workouts/{workoutId}`

```typescript
{
  userId: string
  name: string
  color: number            // ARGB int
  startedAt: Timestamp
  endedAt: Timestamp | null
  isCompleted: boolean
  multiSessionId: string | null
  xpEarned: number | null
  feedback: {
    difficulty: string     // 'easy' | 'medium' | 'hard'
    energyLevel: number    // 1–5
    notes: string | null
    savedAt: Timestamp
  } | null
}
```

### `workouts/{workoutId}/exercises/{exerciseId}`

```typescript
{
  name: string
  nameEs: string | null
  order: number
  exerciseType: string
  notes: string | null
  sets: Array<{
    setNumber: number
    weight: number | null
    reps: number | null
    completed: boolean
    setType: string        // 'warmup' | 'regular' | 'failed' | 'dropset'
    durationSeconds: number | null
    distanceKm: number | null
    inclinationPercent: number | null
  }>
}
```

> Los sets se escriben **en bloque** al finalizar el workout. Durante el workout activo viven en memoria (estado Pinia).

---

### `posts/{postId}`

```typescript
{
  userId: string
  userNickname: string
  userPhotoUrl: string | null
  workoutId: string
  workoutName: string
  durationSeconds: number
  totalVolumeKg: number
  prsCount: number
  exercisesPreview: Array<{
    name: string
    nameEs: string | null
    sets: number
    reps: string
  }>
  likesCount: number
  commentsCount: number
  reactionsMap: Record<string, number>  // emoji → count
  createdAt: Timestamp
}
```

### `posts/{postId}/likes/{userId}`

```typescript
{
  userId: string
  createdAt: Timestamp
}
```

### `posts/{postId}/reactions/{userId}`

```typescript
{
  userId: string
  emoji: string           // '🔥' | '💪' | '😤' | '🧠'
  createdAt: Timestamp
}
```

### `posts/{postId}/comments/{commentId}`

```typescript
{
  userId: string
  userNickname: string
  userPhotoUrl: string | null
  text: string
  createdAt: Timestamp
}
```

---

### `notifications/{notificationId}`

```typescript
{
  toUid: string
  fromUid: string
  fromNickname: string
  fromPhotoUrl: string | null
  type: string              // 'friend_request' | 'follow_request' | 'new_follower' | 'follow_accepted' | 'post_like' | 'post_reaction' | 'post_comment' (los 3 últimos en progreso en `forge`, ver más abajo)
  status: string             // 'pending' | 'accepted' | 'declined' — solo tiene significado real para friend_request/follow_request
  followId: string | null
  postId: string | null      // en progreso — solo en post_like/post_reaction/post_comment
  emoji: string | null       // en progreso — solo en post_reaction
  isRead: boolean
  createdAt: Timestamp
}
```

> ⚠️ **2026-08-08 — en progreso en `forge` (mobile):** se está añadiendo
> soporte de push (FCM) sobre esta misma colección, más un campo nuevo
> `users/{uid}.fcmToken` (ver más abajo) y los 3 tipos `post_*`. La web no
> necesita hacer nada para que esto funcione (la Cloud Function del push
> lee cualquier doc nuevo de `notifications` sea cual sea el cliente que lo
> escribió) pero si la web algún día escribe likes/reacciones/comentarios,
> debería escribir también el doc de `notifications` correspondiente con
> este mismo esquema para que el usuario reciba el push. Ver
> `forge/docs/superpowers/specs/2026-08-08-push-notifications-design.md`
> para el diseño completo.

---

### `follows/{followerId}_{followingId}`

```typescript
{
  followerId: string
  followingId: string
  status: 'pending' | 'accepted'
  createdAt: Timestamp
}
```

> Para obtener el feed: query `follows` donde `followerId == currentUid AND status == 'accepted'` → lista de `followingId` → fetch posts de esos usuarios.

---

### `exercises` (colección global)

```typescript
{
  id: string              // doc ID kebab-case slug
  name: string
  nameEs: string | null
  bodyParts: string[]
  exerciseType: string
  isActive: boolean
  imageUrl: string | null
}
```

> Cacheada en cliente. Fetch una vez y guardar en `sessionStorage` (TTL 1 semana).

---

### `whats_new_items` (colección global)

```typescript
{
  id: string
  title: string
  description: string
  imageUrl: string | null
  order: number
  isActive: boolean
  createdAt: Date | null
  updatedAt: Date | null
}
```

> Gestionada desde `/cms/novedades`. `config/appConfig.whatsNewVersion` (number) se incrementa desde esa misma página ("Forzar reaparición") para que todos los usuarios vuelvan a ver el carrusel.

---

### `getting_started_items` (colección global)

```typescript
{
  id: string
  title: string
  description: string
  imageUrl: string | null
  order: number
  isActive: boolean
  createdAt: Date | null
  updatedAt: Date | null
}
```

> Gestionada desde `/cms/guia-inicio`. Sin campo de versión — a diferencia de `whats_new_items`, no hay "forzar reaparición": la app la lee bajo demanda cuando el usuario abre Settings → Soporte → "Guía de inicio".

---

### `shop_items` (colección global)

```typescript
{
  id: string                          // 'theme_{themeId}' para temas — ver forge/.claude/BACKEND.md; celebración/sonido usan ID aleatorio
  displayName: string
  price: number                       // mancuernitas
  rewardType: 'theme' | 'celebration' | 'xpBoost' | 'soundEffect'
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
  minRankLevel: number
  isActive: boolean
  themeId: string | null              // solo rewardType 'theme'
  celebrationLottieUrl: string | null // solo 'celebration' — animación Lottie (bodymovin JSON)
  boostMultiplier: number | null      // solo 'xpBoost'
  boostDurationHours: number | null   // 'xpBoost', mutuamente excluyente con boostWorkoutsLeft
  boostWorkoutsLeft: number | null    // 'xpBoost', mutuamente excluyente con boostDurationHours
  soundEffect: string | null          // solo 'soundEffect' — slot fijo (metalClink/gymBell/airHorn/crowdCheer)
  soundUrl: string | null             // solo 'soundEffect'
}
```

> Gestionada desde `/cms/tienda`. El tipo de recompensa no se puede cambiar tras crear el producto (cambia el significado de los campos y, para tema, el propio ID del documento). Assets en Storage `shop_items/{itemId}/{fileName}`: audio de `soundEffect` (`sound`), Lottie de `celebration` (`celebration.json`).

---

## Patrones Firestore para web

### Lectura en tiempo real (onSnapshot)

```typescript
import { onSnapshot, doc } from 'firebase/firestore'

const unsub = onSnapshot(doc(db, 'users', uid), (snap) => {
  store.setProfile(snap.data())
})
// Llamar unsub() en onUnmounted
```

### Batch write (finish workout)

```typescript
import { writeBatch, doc, collection, serverTimestamp } from 'firebase/firestore'

const batch = writeBatch(db)
batch.update(doc(db, 'workouts', workoutId), {
  isCompleted: true,
  endedAt: serverTimestamp()
})
exercises.forEach(ex => {
  batch.set(doc(db, 'workouts', workoutId, 'exercises', ex.id), ex)
})
await batch.commit()
```

### Transaction (like toggle)

```typescript
import { runTransaction, doc, increment } from 'firebase/firestore'

await runTransaction(db, async (tx) => {
  const likeRef = doc(db, 'posts', postId, 'likes', userId)
  const likeSnap = await tx.get(likeRef)

  if (likeSnap.exists()) {
    tx.delete(likeRef)
    tx.update(doc(db, 'posts', postId), { likesCount: increment(-1) })
  } else {
    tx.set(likeRef, { userId, createdAt: serverTimestamp() })
    tx.update(doc(db, 'posts', postId), { likesCount: increment(1) })
  }
})
```

### Paginación (workout history)

```typescript
import { query, collection, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore'

let lastDoc: DocumentSnapshot | null = null

async function fetchPage() {
  let q = query(
    collection(db, 'workouts'),
    where('userId', '==', uid),
    orderBy('startedAt', 'desc'),
    limit(10)
  )
  if (lastDoc) q = query(q, startAfter(lastDoc))

  const snap = await getDocs(q)
  lastDoc = snap.docs[snap.docs.length - 1] ?? null
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
```

### FieldValue.increment

```typescript
import { increment, arrayUnion, arrayRemove } from 'firebase/firestore'

// Incrementar contador
update(postRef, { likesCount: increment(1) })

// Añadir a array sin duplicados
update(userRef, { purchasedItems: arrayUnion(itemId) })

// Quitar de array
update(userRef, { purchasedItems: arrayRemove(itemId) })
```

### Server timestamp

```typescript
import { serverTimestamp } from 'firebase/firestore'

set(ref, { createdAt: serverTimestamp() })
```

---

## SEGURIDAD — Firestore & Storage rules (implementado en `forge`, 2026-08-08)

El repo `forge` ha desplegado (o está a punto de desplegar) `firestore.rules`/`storage.rules` que sustituyen las reglas abiertas (`allow read, write: if true`) que estaban en producción desde 2026-04-19. Estas reglas viven en el repo `forge`, pero aplican al mismo proyecto Firebase, así que afectan directamente a esta web:

- **Lectura**: `users`, `exercises`, `shop_items`, `shop_collections`, `config`, `whats_new_items`, `getting_started_items` — cualquier usuario autenticado (Firebase Auth). El login de `/cms` usa el mismo Firebase Auth del proyecto, así que la lectura de `auth.store.ts` (`getDoc(doc(db, 'users', uid))` para comprobar `isAdmin`) sigue funcionando sin cambios.
- **Escritura de `exercises`, `shop_items`, `shop_collections`, `config`, `whats_new_items`, `getting_started_items`**: requiere que el usuario autenticado tenga `users/{uid}.isAdmin == true` (regla `isAdmin()` en `firestore.rules`, evaluada con un `get()` sobre el propio doc). El módulo `/cms/novedades` ya escribe en `whats_new_items` y en `config/appConfig.whatsNewVersion`, `/cms/guia-inicio` en `getting_started_items`, y `/cms/tienda` en `shop_items`, bajo esta regla.
- **Lectura de `workouts` para el CMS**: `workouts/{workoutId}` también permite lectura a `isAdmin()` (además del propio dueño) — el detalle de usuario del CMS (`/cms/usuarios/{uid}`) lista el historial de workouts de cualquier usuario. `update`/`delete` siguen restringidos al dueño.
- **`isAdmin` es de solo lectura desde cualquier cliente** — ni la app móvil ni esta web pueden fijarlo vía escritura normal (bloqueado explícitamente en `forge/firestore.rules`). Se asigna manualmente desde la consola de Firebase o Admin SDK. Si se necesita un flujo de auto-bootstrap del primer admin, tendría que hacerse fuera del alcance de las security rules (script one-off con Admin SDK).
- `faq` y `legal_documents` ya tienen regla propia en `forge/firestore.rules` (`allow read: if true; allow write: if isAdmin();`) — no son placeholders. Módulos futuros de `/cms` sobre otras colecciones nuevas **quedarán denegados por defecto** hasta que se añadan sus reglas correspondientes en `forge/firestore.rules`. Avisar al trabajar en `forge` cuando se implemente un módulo nuevo del CMS que toque una colección no listada arriba.
- Esta web **no tiene backend propio** (no hay `firebase-admin` ni rutas `server/api`) — todo pasa por el SDK cliente, así que está sujeta a estas rules igual que la app móvil.

Ver detalle completo de las reglas y su razonamiento en `forge/.claude/BACKEND.md` sección "SEGURIDAD — FIRESTORE & STORAGE RULES".
