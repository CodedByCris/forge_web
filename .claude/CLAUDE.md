# CLAUDE CONTEXT — GYM APP WEB (Nuxt)

## Objetivo

⚠️ **Giro de alcance, 2026-08-08:** se abandona `/train` (reimplementar en
web un subconjunto de la app móvil — login, workout activo, plantillas,
feed, settings). El código ya existente en `app/pages/train/`,
`app/stores/*`, `app/services/*` sigue en el repo — nadie ha pedido
borrarlo — pero **ya no es el objetivo activo**: no seguir construyendo
sobre él sin confirmar primero. La documentación de ese plan (`AUTH.md`,
`WORKOUT.md`, `TEMPLATES.md`, `FEED.md`, `SETTINGS.md`, `TYPES.md`) se
eliminó de `.claude/` el 2026-08-08 — no aportaba valor como referencia
para el nuevo alcance (portada + `/cms`, que no es un espejo de esas
pantallas). Si hace falta revisar cómo se planteó, está en el historial
de git.

Nuevo alcance, dos zonas:

**Portada pública** (`/`) — canal de adquisición y marketing: hero,
features, social proof, sponsors, CTA. Describe la app, no la reimplementa.

**`/cms`** — panel de administración para gestionar todo el ecosistema:
usuarios, gimnasios afiliados, ejercicios, contenido moderado,
notificaciones push, analytics, configuración global. Ver
`forge/docs/admin_dashboard.md` (planteamiento previo, pensado
originalmente como repo separado `gym-app-admin` — corregido: ahora vive
aquí, en `/cms`). **Alcance detallado todavía sin definir** — pendiente de
un brainstorm dedicado antes de implementar nada de `/cms`.

El backend sigue siendo Firebase compartido con la app móvil (`forge`). **La
estructura Firestore NO cambia** — la web es otro cliente del mismo backend,
tanto la portada como `/cms`.

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

La estructura de capas (`services/` → Firebase; `stores/` → Pinia; `composables/` → lógica de UI reactiva; `pages/` → solo layout; `components/` → UI pura) sigue siendo el patrón de este repo, reutilizable tanto para la portada como para `/cms`:

| Capa | Responsabilidad |
|---|---|
| `services/` | Llamadas Firebase (leer/escribir Firestore, Auth) |
| `stores/` | Estado global con Pinia, acciones que llaman a services |
| `composables/` | Lógica de UI reactiva, wrapping de stores |
| `pages/` | Rutas, solo layout y llamadas a composables |
| `components/` | UI pura, props/emits, sin lógica de negocio |

La estructura de carpetas concreta de `/cms` (qué stores/services/types necesita) está **sin definir** — se decide en el brainstorm dedicado antes de tocar código. No asumir la estructura antigua de `/train` como plantilla sin más — `/cms` es un panel de admin, no un espejo de pantallas de usuario final, sus necesidades de datos son distintas (listados paginados, moderación, bulk actions, analytics).

---

## Reglas de trabajo

- **NO** generar toda la app de golpe
- Feature a feature, esperando confirmación
- Código TypeScript estricto — sin `any`
- Sin tests (misma regla que la app móvil)
- Todos los textos mediante i18n
- Dark mode siempre activo
- Responsive: mobile-first (puede usarse desde móvil)
- **No usar emoticonos/emojis en los textos** (UI, i18n, toasts, copy en general)
- **NUNCA hagas commits automáticos.** Los commits los hace el usuario siempre — deja el trabajo en el working tree, que decida él cuándo y qué commitear.

### Selección de modelo

Cuando se dispatchen subagentes o se pregunte qué modelo usar:
- **Opus**: tareas muy profundas (arquitectura compleja, debugging difícil, refactors grandes)
- **Sonnet**: trabajo normal del día a día (la mayoría de features/bugfixes)
- **Haiku**: tareas muy básicas (cambios triviales, lookups simples, formateo)

---

## Sincronización con el repo móvil (`forge`)

Este proyecto comparte el mismo backend Firebase (`gym-app-41fd6`) que la app
móvil (`forge`). Regla permanente: **`BACKEND.md`, `FUNCTIONS.md` e
`INDICES.md` deben reflejar siempre el mismo esquema/funciones/índices
reales que sus equivalentes en `forge/.claude/BACKEND.md`,
`forge/.claude/FUNCTIONS.md` y `forge/.claude/INDICES.md`** (no significa
archivos idénticos — `forge` documenta mucho más, fuera del alcance de la
web — significa que los hechos compartidos, colecciones/campos/Cloud
Functions/índices que ambos tocan, no pueden divergir ni quedar
desactualizados entre repos). `forge` es dueño de `firestore.indexes.json`
y del despliegue de índices — este repo solo documenta una copia.

- Al cambiar algo en el esquema Firestore, una Cloud Function o un índice
  desde este repo: actualizar también `forge/.claude/BACKEND.md`/
  `FUNCTIONS.md`/`INDICES.md` directamente en ese repo (acceso vía Firebase
  CLI + acceso a ambos repos en disco — sin copias espejo intermedias).
- Al trabajar en `forge` y tocar algo que la web también usa: actualizar
  este `BACKEND.md`/`FUNCTIONS.md`/`INDICES.md` igual.
- Las reglas de Firestore/Storage están **completamente abiertas ahora
  mismo** (`allow read, write: if true`, sin excepción) — pendiente de
  cerrarse, decisión explícita del usuario por ahora. No asumir que hay
  ninguna restricción de seguridad real todavía (ver nota igual en
  `forge/.claude/CLAUDE.md`).

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

Sin definir todavía. `/cms` va a necesitar su propio middleware de
protección — probablemente con un check de rol/admin además de
autenticación (ver `users.role` en `BACKEND.md`), no un `auth.ts`
genérico. Se define en el brainstorm dedicado de `/cms`, junto con el
resto de su arquitectura.

---

## Documentación relacionada

- `BACKEND.md` — Esquema Firestore completo
- `FUNCTIONS.md` — Cloud Functions relevantes
- `INDICES.md` — Índices compuestos de Firestore (sincronizado con `forge`)
