# Cloud Functions — Relevantes para Web (/train)

Proyecto Firebase: `gym-app-41fd6`
Runtime: Node 20 · API Gen 2

La web **no despliega** Cloud Functions nuevas. Usa las existentes de la app móvil.

---

## Funciones que impactan la web

### `onWorkoutCompleted`

**Trigger:** Firestore `onDocumentWritten("workouts/{workoutId}")` — cuando `isCompleted` pasa de false a true.

**Qué hace (relevante para web):**
1. Calcula `currentStreak` del usuario
2. Otorga XP con guard anti-doble-award (`lastXpDate`)
3. Actualiza `users/{uid}.totalXp`, `lastXpDate`, `currentStreak`
4. Desbloquea badges automáticamente

**Impacto en web:**
- La web escribe `isCompleted: true` al terminar workout → esta función se activa
- El cliente web también intenta otorgar XP directamente (`awardWorkoutXpIfNotToday`). El guard `lastXpDate` evita doble award — gana el que llegue primero
- La web debe leer `users/{uid}.totalXp` como fuente de verdad (no valor local)

**Guard anti-doble-award:**
```typescript
// services/xp.service.ts
async function awardWorkoutXp(userId: string, xpAmount: number, coinAmount: number) {
  const today = new Date().toISOString().split('T')[0]  // 'YYYY-MM-DD'

  return await runTransaction(db, async (tx) => {
    const userRef = doc(db, 'users', userId)
    const userSnap = await tx.get(userRef)
    const data = userSnap.data()!

    if (data.lastXpDate === today) {
      return { alreadyAwarded: true, newTotalXp: data.totalXp, newCoins: data.coins }
    }

    const newXp = (data.totalXp ?? 0) + xpAmount
    const newCoins = (data.coins ?? 0) + coinAmount

    tx.update(userRef, {
      totalXp: newXp,
      lastXpDate: today,
      coins: newCoins,
    })

    return { alreadyAwarded: false, newTotalXp: newXp, newCoins }
  })
}
```

---

### `dailyStreakReset`

**Schedule:** Cada día a las 02:00 UTC

**Impacto en web:**
- Resetea `currentStreak = 0` en usuarios que no entrenaron ayer
- La web lee `users/{uid}.currentStreak` — siempre actualizado por esta función
- No hace nada que la web deba gestionar

---

### `weeklyGoalReset`

**Schedule:** Cada lunes a las 00:05 UTC

**Impacto en web:**
- Archiva datos del objetivo semanal en `users/{uid}/weeklyGoal/{weekId}`
- El historial de objetivos queda disponible si se implementa pantalla de historial

---

### `weeklyFatigueScore`

**Schedule:** Cada domingo a las 23:50 UTC

**Impacto en web:**
- Escribe `users/{uid}.fatigueScore` (0–100)
- La web puede mostrar este valor en settings o dashboard si se desea

---

### `sendNotificationPush` (⚠️ en progreso, no desplegada todavía — 2026-08-08)

**Trigger:** Firestore `onDocumentCreated('notifications/{notifId}')`

Envía un push FCM al `toUid` de cualquier doc nuevo en `notifications`
(like, reacción, comentario, follow, friend request), leyendo
`users/{toUid}.fcmToken`. Genérica — no le importa qué cliente escribió el
doc. Ver `forge/docs/superpowers/plans/2026-08-08-push-notifications.md`.

**Impacto en web:** ninguno hasta que la web escriba en `notifications` o
`users.fcmToken` (no lo hace en el MVP actual). Si en el futuro la web
implementa likes/comentarios, debería escribir el doc de `notifications`
correspondiente (ver `BACKEND.md`) para que esta función dispare el push.

---

## Funciones NO relevantes para web (MVP)

| Función | Por qué no aplica |
|---|---|
| `createUserDocument` | Los usuarios ya existen (vienen de la app móvil) |
| `onRankedSessionBothFinished` | Ranked Mode no en scope web |
| `weeklyRankingReset` | Leaderboard no en scope web |
| `onPrUpdated` | PRs calculados en cliente |

---

## Flujo XP completo al terminar workout

```
Web: batch write (isCompleted=true + exercises)
  ↓
[Firestore trigger]
  ↓ en paralelo
Web: awardWorkoutXpIfNotToday()     Cloud Function: onWorkoutCompleted()
     ↓                                    ↓
   Transaction:                      Transaction:
   lee lastXpDate                    lee lastXpDate
     ↓                                    ↓
   Si ya fue hoy → skip              Si ya fue hoy → skip
   Si no → escribe XP + coins        Si no → escribe XP
     ↓
   Gana quien llegue primero → el segundo sale sin escribir
```

La web no necesita coordinar con la Cloud Function. El guard `lastXpDate` hace el trabajo.

---

## Notas de seguridad

- La web usa el mismo proyecto Firebase → mismas Security Rules
- ⚠️ **2026-08-08 — corregido:** las Security Rules desplegadas de verdad
  (comprobado vía Firebase Rules API, no solo el archivo del repo) son
  `allow read, write: if true` en **todo** Firestore y Storage — no hay
  ningún check de `request.auth.uid`. El texto anterior de esta nota
  (que asumía una regla tipo `request.auth.uid == resource.data.userId`)
  era incorrecto/aspiracional, nunca llegó a desplegarse. Pendiente de
  cerrar — no construir nada que dependa de que Firestore rechace
  escrituras no autorizadas hasta que se resuelva.
- Las Cloud Functions tienen permisos de Admin SDK (bypasan rules siempre, esto sí es cierto independientemente de lo anterior)
- La web **nunca** debe escribir XP directamente en producción sin el guard (la CF puede llegar antes) — esto sigue aplicando por la lógica de negocio (evitar doble-award), no por seguridad de rules
