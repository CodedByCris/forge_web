# Feature: Retos (CMS)

## Qué hace
Módulo `/cms/retos`: listar, crear, editar, activar/desactivar y borrar retos de la app (`gym_app`). El progreso y la recompensa los calcula la Cloud Function `onWorkoutCompleted`; el CMS no los toca.

## Archivos principales
- `app/pages/cms/retos/index.vue`
- `app/components/cms/challenges/{ChallengeRow,ChallengeFormModal}.vue`
- `app/stores/cms/challenges.store.ts`, `app/services/cms/challenges.service.ts`, `app/types/cms/challenge.ts`
- Enlace "Retos" en `CmsSidebar.vue`

## Firestore
`challenges/{id}`: `title`, `description`, `type` (`workouts|volumeKg|durationMinutes|duels`), `target`, `rewardCoins`, `rewardXp`, `startsAt`, `endsAt`, `isActive`, `imageUrl`, `createdAt`. Ver `.claude/BACKEND.md`.

## Cloud Functions
`onWorkoutCompleted` (progreso y recompensa). Ver `.claude/FUNCTIONS.md`.

## Decisiones técnicas
- Mismo patrón que FAQ (service + store Pinia + modal).
- `endsAt` se guarda a las 23:59:59 del día elegido para que el último día cuente entero.
- `imageUrl` es un campo de texto opcional; no hay subida a Storage todavía.
- Sin índice compuesto (`orderBy('endsAt')`).

## Pendientes / TODOs
- Subida de imagen a Storage (patrón de `/cms/novedades`).
- Cambiar tipos o `target` de un reto con progreso ya calculado no recalcula usuarios existentes.
- Requiere desplegar `firestore.rules` de gym_app#1 (regla `challenges`) para poder escribir.
