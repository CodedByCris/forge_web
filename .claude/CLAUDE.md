# CLAUDE CONTEXT — GYM APP WEB (Nuxt)

## Objetivo

Implementar `/train` dentro de una web Nuxt existente. Esta ruta cubre un subconjunto de la app fitness móvil (Flutter). **No construir la app entera.** Features incluidas:

- Inicio de sesión (Firebase Auth)
- Entrenamiento activo (workout normal)
- Plantillas de entrenamiento
- Feed social
- Settings de cuenta

El backend es Firebase compartido con la app móvil. **La estructura Firestore NO cambia.** La web es otro cliente del mismo backend.

---

## Stack

- **Framework**: Nuxt 3 (Vue 3 + Composition API)
- **State**: Pinia
- **Firebase**: `firebase` SDK v10+ (modular)
- **Estilos**: Tailwind CSS
- **Tipado**: TypeScript estricto
- **i18n**: `@nuxtjs/i18n` (ES/EN, igual que la app)
- **Iconos**: Lucide Vue o Heroicons

---

## Arquitectura

```
/train/
  composables/       ← lógica reutilizable (useAuth, useWorkout, useFeed…)
  stores/            ← Pinia stores (authStore, workoutStore, feedStore…)
  services/          ← Firebase datasources (firestore calls)
  types/             ← TypeScript interfaces y enums
  pages/             ← rutas de Nuxt
    index.vue        ← dashboard / home
    auth/
      login.vue
    workout/
      [id].vue       ← workout activo
    templates/
      index.vue
    feed/
      index.vue
    settings/
      index.vue
  components/        ← componentes UI reutilizables
    workout/
    feed/
    settings/
    shared/
```

### Capas

| Capa | Responsabilidad |
|---|---|
| `services/` | Llamadas Firebase (leer/escribir Firestore, Auth) |
| `stores/` | Estado global con Pinia, acciones que llaman a services |
| `composables/` | Lógica de UI reactiva, wrapping de stores |
| `pages/` | Rutas, solo layout y llamadas a composables |
| `components/` | UI pura, props/emits, sin lógica de negocio |

---

## Reglas de trabajo

- **NO** generar toda la app de golpe
- Feature a feature, esperando confirmación
- Código TypeScript estricto — sin `any`
- Sin tests (misma regla que la app móvil)
- Todos los textos mediante i18n
- Dark mode siempre activo
- Responsive: mobile-first (puede usarse desde móvil)

---

## UI / UX

- Dark mode energético, estilo fitness app
- Cards con sombras sutiles
- Tipografía grande y clara para stats/números
- Microinteracciones: hover, focus, loading states
- Transiciones suaves entre páginas (300ms)
- Feedback visual en botones (loading spinner)
- Toast notifications para acciones (éxito/error)

---

## Firebase Init

```typescript
// plugins/firebase.client.ts
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  // Config del proyecto gym-app-41fd6
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
```

Proyecto Firebase: `gym-app-41fd6`

---

## Rutas protegidas

Middleware `auth.ts`: si no hay usuario autenticado → redirect a `/train/auth/login`.

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware(() => {
  const { user } = useAuthStore()
  if (!user) return navigateTo('/train/auth/login')
})
```

---

## Documentación relacionada

- `BACKEND.md` — Esquema Firestore completo
- `AUTH.md` — Feature autenticación
- `WORKOUT.md` — Feature workout activo
- `TEMPLATES.md` — Feature plantillas
- `FEED.md` — Feature feed social
- `SETTINGS.md` — Feature settings
- `FUNCTIONS.md` — Cloud Functions relevantes
- `TYPES.md` — TypeScript types compartidos
